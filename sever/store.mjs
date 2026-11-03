
import { hashPassword, verifyPassword } from './password.mjs';
import { createSeed } from './seed.mjs';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = process.env.CARSTORE_DB ||
    fileURLToPath(new URL('./data/carstore.sqlite', import.meta.url));

mkdirSync(dirname(file), { recursive: true });

const sql = new DatabaseSync(file);

sql.exec(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS store (
        id INTEGER PRIMARY KEY CHECK(id=1),
        value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires INTEGER NOT NULL
    );
`);

const sessions = {
    get: token => sql.prepare(
        'SELECT user_id FROM sessions WHERE token=? AND expires>?'
    ).get(token || '', Date.now())?.user_id,

    create: id => {
        const token = randomBytes(32).toString('hex');

        sql.prepare('INSERT INTO sessions VALUES(?,?,?)')
            .run(token, id, Date.now() + 8 * 3600000);

        return token;
    },

    remove: token => sql.prepare(
        'DELETE FROM sessions WHERE token=?'
    ).run(token || '')
};

const tables = [
    'cars',
    'brands',
    'types',
    'users',
    'consultations',
    'testdrives',
    'orders'
];

const check = (ok, message) => {
    if (!ok) {
        throw new Error(message);
    }
};

const clean = row => {
    const { passwordHash, ...value } = row;
    return value;
};

const staff = u => u && ['admin', 'staff'].includes(u.role);

function write(db) {
    sql.prepare('INSERT OR REPLACE INTO store VALUES(1,?)')
        .run(JSON.stringify(db));
}

export function loadStore() {
    const row = sql.prepare(
        'SELECT value FROM store WHERE id=1'
    ).get();

    if (row) {
        return JSON.parse(row.value);
    }

    const db = createSeed();
    write(db);

    return db;
}

function current(db, token) {
    const u = db.users.find(
        x => x.id === sessions.get(token) && x.active
    );

    check(u, 'Vui lòng đăng nhập bằng tài khoản hoạt động');
    return u;
}

function txt(d, k, required = true) {
    const v = d[k] ?? '';

    check(typeof v === 'string', k + ' phải là chuỗi');

    const s = v.trim();

    check(!required || s.length, k + ' không được trống');
    check(s.length <= 3000, k + ' quá dài');

    return s;
}

function num(d, k, min = 0) {
    check(
        d[k] !== '' &&
        d[k] !== null &&
        d[k] !== undefined &&
        typeof d[k] !== 'boolean',
        k + ' không hợp lệ'
    );

    const n = Number(d[k]);

    check(
        Number.isSafeInteger(n) && n >= min,
        k + ' phải là số nguyên từ ' + min
    );

    return n;
}

function flag(d, k) {
    const n = num(d, k);
    check([0, 1].includes(n), k + ' phải là 0 hoặc 1');
    return n;
}

function unique(db, t, k, v, id) {
    check(
        !db[t].some(x =>
            x.id !== id &&
            String(x[k]).toLowerCase() === String(v).toLowerCase()
        ),
        k + ' đã tồn tại'
    );
}

const flows = {
    consultations: {
        new: ['new', 'processing', 'cancelled'],
        processing: ['processing', 'completed', 'cancelled'],
        completed: [],
        cancelled: []
    },
    orders: {
        pending: ['pending', 'confirmed', 'cancelled'],
        confirmed: ['confirmed', 'completed', 'cancelled'],
        completed: [],
        cancelled: []
    },
    testdrives: {
        pending: ['pending', 'confirmed', 'cancelled'],
        confirmed: ['confirmed', 'completed', 'cancelled'],
        completed: [],
        cancelled: []
    }
};

async function prepare(db, t, d, u, old) {
    if (['brands', 'types'].includes(t)) {
        check(u.role === 'admin', 'Chỉ quản trị viên');

        const name = txt(d, 'name');
        unique(db, t, 'name', name, old?.id);

        const logo = txt(d, 'logo', false);

        check(
            !logo || /^(https?:\/\/|\/)/.test(logo),
            'Logo phải là URL http(s) hoặc đường dẫn /images/...'
        );

        return {
            name,
            description: txt(d, 'description', false),
            logo,
            active: flag(d, 'active')
        };
    }

    if (t === 'cars') {
        check(u.role === 'admin', 'Chỉ quản trị viên');

        const v = {
            code: txt(d, 'code'),
            name: txt(d, 'name'),
            brand_id: num(d, 'brand_id', 1),
            type_id: num(d, 'type_id', 1),
            price: num(d, 'price', 1),
            stock: num(d, 'stock'),
            image: txt(d, 'image', false),
            specs: txt(d, 'specs', false),
            year: num(d, 'year', 1886),
            fuel: txt(d, 'fuel'),
            transmission: txt(d, 'transmission'),
            seats: num(d, 'seats', 1),
            active: flag(d, 'active'),
            test_drive: flag(d, 'test_drive')
        };

        unique(db, t, 'code', v.code, old?.id);

        [
            ['brands', 'brand_id'],
            ['types', 'type_id']
        ].forEach(([table, key]) => {
            const cat = db[table].find(x => x.id === v[key]);

            check(cat, 'Danh mục không tồn tại');
            check(
                cat.active || old?.[key] === v[key],
                'Danh mục đã ngừng hoạt động'
            );
        });

        check(
            !v.image || /^(https?:\/\/|\/)/.test(v.image),
            'Ảnh phải là URL http(s) hoặc đường dẫn /images/...'
        );

        return v;
    }

    if (t === 'users') {
        check(old, 'Tạo tài khoản tại trang Đăng ký');
        check(
            u.id === old.id || u.role === 'admin',
            'Không có quyền sửa tài khoản'
        );

        const v = {
            name: txt(d, 'name'),
            phone: txt(d, 'phone', false)
        };

        check(
            !v.phone || /^\d{10}$/.test(v.phone),
            'Điện thoại phải có 10 chữ số'
        );

        if (d.password) {
            check(u.id === old.id, 'Chỉ đổi mật khẩu của mình');
            check(
                txt(d, 'password').length >= 8,
                'Mật khẩu ít nhất 8 ký tự'
            );

            v.passwordHash = await hashPassword(d.password);
        }

        if (u.role === 'admin') {
            v.role = txt(d, 'role');
            v.active = flag(d, 'active');

            check(
                ['admin', 'staff', 'customer'].includes(v.role),
                'Quyền không hợp lệ'
            );

            check(
                u.id !== old.id || (v.role === 'admin' && v.active),
                'Không tự khóa/hạ quyền admin'
            );
        }

        return v;
    }

    const owner = old?.user_id ?? u.id;

    check(
        owner === u.id || staff(u),
        'Không có quyền sửa hồ sơ này'
    );

    const start = t === 'consultations' ? 'new' : 'pending';
    const status = old ? txt(d, 'status') : start;

    if (old) {
        check(
            flows[t][old.status]?.includes(status),
            'Chuyển trạng thái không hợp lệ hoặc hồ sơ đã kết thúc'
        );

        if (!staff(u)) {
            const cancellingDrive =
                t === 'testdrives' &&
                old.status === 'confirmed' &&
                status === 'cancelled';

            check(
                old.status === start || cancellingDrive,
                'Hồ sơ đã được tiếp nhận'
            );

            check(
                [start, 'cancelled'].includes(status),
                'Khách hàng không được tự xác nhận'
            );

            if (cancellingDrive) {
                check(
                    txt(d, 'slot') === old.slot &&
                    txt(d, 'name') === old.name &&
                    txt(d, 'phone') === old.phone,
                    'Lịch đã xác nhận chỉ được hủy, không sửa thông tin'
                );
            }
        }
    }

    const car_id = old
        ? old.car_id
        : (
            t === 'consultations' && !d.car_id
                ? null
                : num(d, 'car_id', 1)
        );

    const car = car_id
        ? db.cars.find(x => x.id === car_id)
        : null;

    check(
        (t === 'consultations' && car_id === null) || car,
        'Xe không tồn tại'
    );

    check(
        old || !car || car.active,
        'Xe đã ngừng kinh doanh'
    );

    const v = {
        user_id: owner,
        car_id,
        status,
        name: txt(d, 'name'),
        phone: txt(d, 'phone')
    };

    check(
        /^\d{10}$/.test(v.phone),
        'Điện thoại phải có 10 chữ số'
    );

    if (t === 'consultations') {
        v.content = txt(d, 'content');
        v.note = staff(u)
            ? txt(d, 'note', false)
            : (old?.note ?? '');
    }

    if (t === 'testdrives') {
        const date = new Date(txt(d, 'slot'));

        check(
            !Number.isNaN(date.getTime()),
            'Ngày giờ không hợp lệ'
        );

        v.slot = date.toISOString();

        if (
            !old ||
            v.slot !== old.slot ||
            (status === 'confirmed' && old.status !== 'confirmed')
        ) {
            check(
                date.getTime() > Date.now(),
                'Lịch phải ở tương lai'
            );

            const vn = new Date(date.getTime() + 7 * 3600000);

            check(
                vn.getUTCHours() >= 8 &&
                vn.getUTCHours() < 17 &&
                vn.getUTCMinutes() === 0 &&
                vn.getUTCSeconds() === 0,
                'Chọn đầu giờ 08:00–16:00 Việt Nam'
            );

            check(
                car.active && car.test_drive,
                'Xe không hỗ trợ lái thử'
            );
        }

        if (status === 'confirmed') {
            check(
                !db.testdrives.some(x =>
                    x.id !== old?.id &&
                    x.car_id === car_id &&
                    x.slot === v.slot &&
                    x.status === 'confirmed'
                ),
                'Xe đã có lịch xác nhận trong khung giờ này'
            );
        }
    }

    if (t === 'orders') {
        v.price = old?.price ?? car.price;

        // Chốt giá khi tạo đơn.
        // Xác nhận giảm tồn kho, hủy đơn đã xác nhận hoàn tồn một lần.
        if (
            old?.status === 'pending' &&
            status === 'confirmed'
        ) {
            check(
                car.active && car.stock > 0,
                'Xe ngừng kinh doanh hoặc hết tồn'
            );

            car.stock--;
        }

        if (
            old?.status === 'confirmed' &&
            status === 'cancelled'
        ) {
            car.stock++;
        }
    }

    return v;
}

function remove(db, t, row, u) {
    if (['cars', 'brands', 'types'].includes(t)) {
        check(u.role === 'admin', 'Chỉ quản trị viên');

        if (
            t === 'cars' &&
            ['orders', 'consultations', 'testdrives'].some(k =>
                db[k].some(x => x.car_id === row.id)
            )
        ) {
            row.active = 0;
            return;
        } else {
            check(
                !db.cars.some(
                    x => x[t === 'brands' ? 'brand_id' : 'type_id'] === row.id
                ),
                'Danh mục đang được xe sử dụng'
            );
        }
    } else if (t === 'users') {
        check(
            u.id === row.id || u.role === 'admin',
            'Không có quyền xóa tài khoản'
        );

        check(row.role !== 'admin', 'Không xóa admin');

        if (
            ['orders', 'consultations', 'testdrives'].some(k =>
                db[k].some(x => x.user_id === row.id)
            )
        ) {
            row.active = 0;
            return;
        }
    } else {
        check(
            row.user_id === u.id || staff(u),
            'Không có quyền xóa'
        );

        check(
            ['new', 'pending'].includes(row.status),
            'Chỉ xóa hồ sơ mới/chờ; hồ sơ xác nhận phải hủy bằng trạng thái'
        );
    }

    db[t] = db[t].filter(x => x.id !== row.id);
}

export async function storeRequest(
    path,
    method = 'GET',
    data = {},
    token = ''
) {
    const db = loadStore();
    const [t, idText, ...extra] = path.split('/');
    const id = idText ? Number(idText) : null;

    if (t === 'register' && method === 'POST') {
        const email = txt(data, 'email').toLowerCase();

        check(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            'Email không hợp lệ'
        );

        unique(db, 'users', 'email', email);

        const password = txt(data, 'password');

        check(
            password.length >= 8,
            'Mật khẩu ít nhất 8 ký tự'
        );

        const passwordHash = await hashPassword(password);

        db.users.push({
            id: Math.max(0, ...db.users.map(x => x.id)) + 1,
            name: txt(data, 'name'),
            email,
            passwordHash,
            role: 'customer',
            active: 1,
            phone: ''
        });

        write(db);
        return {};
    }

    if (t === 'login' && method === 'POST') {
        const u = db.users.find(
            x => x.email === txt(data, 'email').toLowerCase() && x.active
        );

        check(
            u && await verifyPassword(
                txt(data, 'password'),
                u.passwordHash
            ),
            'Email/mật khẩu sai hoặc tài khoản bị khóa'
        );

        return {
            user: clean(u),
            token: sessions.create(u.id)
        };
    }

    if (t === 'logout') {
        sessions.remove(token);
        return {};
    }

    if (t === 'me') {
        return clean(current(db, token));
    }

    check(
        tables.includes(t) &&
        !extra.length &&
        (!idText || Number.isSafeInteger(id)),
        'Tài nguyên không hợp lệ'
    );

    const pub =
        method === 'GET' &&
        ['cars', 'brands', 'types'].includes(t);

    let u = null;

    if (pub) {
        try {
            u = current(db, token);
        } catch {
            
        }
    } else {
        u = current(db, token);
    }

    const old = id === null
        ? null
        : db[t].find(x => x.id === id);

    if (id !== null) {
        check(old, 'Không tìm thấy dữ liệu');
    }

    if (method === 'GET') {
        let rows = db[t];

        if (t === 'users') {
            check(
                u.role === 'admin' || id === u.id,
                'Chỉ admin xem danh sách tài khoản'
            );

            if (u.role !== 'admin') {
                rows = rows.filter(x => x.id === u.id);
            }
        } else if (['cars', 'brands', 'types'].includes(t)) {
            if (!staff(u)) {
                rows = rows.filter(x => x.active);
            }
        } else if (!staff(u)) {
            rows = rows.filter(x => x.user_id === u.id);
        }

        rows = rows
            .filter(x => id === null || x.id === id)
            .map(clean)
            .reverse();

        if (id !== null) {
            check(rows.length, 'Không có quyền xem');
            return rows[0];
        }

        return rows;
    }

    if (method === 'DELETE') {
        check(old, 'Thiếu ID');

        remove(db, t, old, u);
        write(db);

        return {
            message: db[t].some(x => x.id === old.id)
                ? 'Đã chuyển sang trạng thái ngừng hoạt động.'
                : 'Đã xóa hồ sơ.'
        };
    }

    check(
        ['POST', 'PUT'].includes(method),
        'Thao tác không hỗ trợ'
    );

    check(
        (method === 'POST' && id === null) ||
        (method === 'PUT' && old),
        'Đường dẫn không hợp lệ'
    );

    const values = await prepare(db, t, data, u, old);

    let result;

    if (old) {
        Object.assign(old, values);
        result = old;
    } else {
        result = {
            id: Math.max(0, ...db[t].map(x => x.id)) + 1,
            created_at: new Date().toISOString(),
            ...values
        };

        db[t].push(result);
    }

    write(db);

    return clean(result);
}
