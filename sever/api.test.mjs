
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.NODE_ENV = 'test';

const dir = mkdtempSync(join(tmpdir(), 'carstore-'));
process.env.CARSTORE_DB = join(dir, 'test.sqlite');

const { server } = await import('./index.mjs');

await new Promise(r => server.listen(0, '127.0.0.1', r));

const base = `http://127.0.0.1:${server.address().port}/api/`;  

function client() {
    let cookie = '';

    return async (path, method = 'GET', data) => {
        const r = await fetch(
            base + path,
            {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: cookie
                },
                body: data
                    ? JSON.stringify(data)
                    : undefined
            }
        );

        if (r.headers.get('set-cookie')) {
            cookie = r.headers.get('set-cookie').split(';')[0];
        }

        const value = await r.json();

        if (!r.ok) {
            throw Error(value.message);
        }

        return value;
    };
}

const login = (c, role) => c(
    'login',
    'POST',
    {
        email: role + '@carstore.local',
        password: role[0].toUpperCase() + role.slice(1) + '123!'
    }
);

test('HTTP API: CRUD, quyền, tồn kho, lịch trùng và lưu SQLite', async () => {
    try {
        const admin = client();
        const customer = client();
        const other = client();

        await login(admin, 'admin');
        await login(customer, 'customer');

        let b = await admin(
            'brands',
            'POST',
            {
                name: 'Hãng mới',
                active: 1
            }
        );

        b = await admin(
            'brands/' + b.id,
            'PUT',
            {
                ...b,
                name: 'Hãng sửa'
            }
        );

        assert.equal(
            (await admin('brands/' + b.id)).name,
            'Hãng sửa'
        );

        await admin('brands/' + b.id, 'DELETE');

        await assert.rejects(
            admin('brands/1', 'DELETE')
        );

        await assert.rejects(
            customer('cars', 'POST', {})
        );

        await assert.rejects(
            admin(
                'register',
                'POST',
                {
                    name: 'x',
                    email: 'customer@carstore.local',
                    password: '12345678'
                }
            )
        );

        const car = await admin('cars/1');

        const contact = {
            car_id: 1,
            name: 'Khách',
            phone: '0912345678'
        };

        const order = await customer(
            'orders',
            'POST',
            {
                ...contact,
                price: 1
            }
        );

        assert.equal(order.price, car.price);

        await other(
            'register',
            'POST',
            {
                name: 'Khác',
                email: 'other@test.local',
                password: '12345678'
            }
        );

        await other(
            'login',
            'POST',
            {
                email: 'other@test.local',
                password: '12345678'
            }
        );

        await assert.rejects(
            other('orders/' + order.id)
        );

        await Promise.all([
            admin(
                'orders/' + order.id,
                'PUT',
                {
                    ...order,
                    status: 'confirmed'
                }
            ),
            admin(
                'orders/' + order.id,
                'PUT',
                {
                    ...order,
                    status: 'confirmed'
                }
            )
        ]);

        assert.equal(
            (await admin('cars/1')).stock,
            car.stock - 1
        );

        await admin(
            'orders/' + order.id,
            'PUT',
            {
                ...order,
                status: 'cancelled'
            }
        );

        assert.equal(
            (await admin('cars/1')).stock,
            car.stock
        );

        await assert.rejects(
            admin(
                'orders/' + order.id,
                'PUT',
                {
                    ...order,
                    status: 'cancelled'
                }
            )
        );

        const date = new Date(Date.now() + 3 * 86400000);

        date.setUTCHours(3, 0, 0, 0);

        const d = {
            ...contact,
            slot: date.toISOString()
        };

        const a = await customer(
            'testdrives',
            'POST',
            d
        );

        const z = await customer(
            'testdrives',
            'POST',
            d
        );

        await admin(
            'testdrives/' + a.id,
            'PUT',
            {
                ...a,
                status: 'confirmed'
            }
        );

        await assert.rejects(
            admin(
                'testdrives/' + z.id,
                'PUT',
                {
                    ...z,
                    status: 'confirmed'
                }
            )
        );

        await admin('cars/1', 'DELETE');

        assert.equal(
            (await admin('cars/1')).active,
            0
        );

        const { loadStore } = await import('./store.mjs');

        const saved = loadStore();

        assert(
            saved.users.every(u =>
                u.passwordHash && !u.password
            )
        );

        assert(
            saved.orders.some(o =>
                o.id === order.id
            )
        );

        assert(
            !JSON.stringify(
                await admin('users')
            ).includes('passwordHash')
        );

        await admin('users/3', 'DELETE');

        await assert.rejects(
            customer(
                'orders',
                'POST',
                contact
            )
        );

    } finally {
        await new Promise(r => server.close(r));

        rmSync(dir, {
            recursive: true,
            force: true
        });
    }
});
