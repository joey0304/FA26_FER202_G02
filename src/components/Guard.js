import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Guard({ roles, children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <p>Đang tải phiên...</p>;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname + location.search
                }}
            />
        );
    }

    if (roles && !roles.includes(user.role)) {
        return (
            <p className="error" role="alert">
                Bạn không có quyền truy cập trang này.
            </p>
        );
    }

    return children;
}
