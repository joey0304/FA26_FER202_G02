
import { createServer } from 'node:http';
import { storeRequest } from './store.mjs';

let queue = Promise.resolve();

const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

export const server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.headers.origin) {
        if (req.headers.origin !== origin) {
            res.writeHead(403);
            res.end(JSON.stringify({
                message: 'Origin không được phép'
            }));
            return;
        }

        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    }

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        const url = new URL(req.url, 'http://localhost');

        if (!url.pathname.startsWith('/api/')) {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: 'Không tìm thấy API'
            }));
            return;
        }

        const path = url.pathname.slice(5);

        if (['login', 'register'].includes(path) && req.method !== 'POST') {
            throw Error('Yêu cầu POST');
        }

        if (path === 'logout' && req.method !== 'POST') {
            throw Error('Yêu cầu POST');
        }

        let raw = '';

        for await (const chunk of req) {
            raw += chunk;

            if (Buffer.byteLength(raw) > 1000000) {
                throw Error('Nội dung quá lớn');
            }
        }

        const data = raw ? JSON.parse(raw) : {};

        const token = (req.headers.cookie || '')
            .split(';')
            .map(v => v.trim())
            .find(v => v.startsWith('carstore_session='))
            ?.slice(17) || '';

        const task = queue.then(() =>
            storeRequest(path, req.method, data, token)
        );

        queue = task.catch(() => {});

        const result = await task;

        if (path === 'login') {
            res.setHeader(
                'Set-Cookie',
                `carstore_session=${result.token}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=28800${
                    process.env.COOKIE_SECURE === 'true' ? '; Secure' : ''
                }`
            );

            delete result.token;
        }

        if (path === 'logout') {
            res.setHeader(
                'Set-Cookie',
                'carstore_session=; HttpOnly; SameSite=Lax; Path=/api; Max-Age=0'
            );
        }

        res.end(JSON.stringify(result));

    } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
            message: error.message
        }));
    }
});

if (process.env.NODE_ENV !== 'test') {
    server.listen(
        Number(process.env.PORT || 5000),
        '127.0.0.1',
        () => console.log('CarStore API: http://localhost:5000/api')
    );
}
