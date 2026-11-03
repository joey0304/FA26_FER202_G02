
export const money = v =>
    Number(v).toLocaleString('vi-VN') + ' ₫';

const API = process.env.REACT_APP_API_URL || '/api';

export async function storeRequest(path, method = 'GET', data = {}) {
    let response;

    try {
        response = await fetch(
            `${API}/${path}`,
            {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                ...(method === 'GET'
                    ? {}
                    : {
                        body: JSON.stringify(data)
                    }
                )
            }
        );
    } catch {
        throw new Error(
            'Không kết nối được API. Hãy chạy npm run server.'
        );
    }

    const value = await response.json().catch(() => ({
        message: 'API trả dữ liệu không hợp lệ'
    }));

    if (!response.ok) {
        throw new Error(
            value.message || 'Yêu cầu thất bại'
        );
    }

    return value;
}
