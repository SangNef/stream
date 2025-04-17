import { Navigate } from "react-router-dom";
import { getAccessTokenFromLS, clearAccessToken } from "../../utils/auth";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const accessToken = getAccessTokenFromLS() as string;
    if (!accessToken) {
        return <Navigate to="/login" />;
    }

    try {
        const decoded: any = jwtDecode(accessToken);
        console.log(decoded);
        if (decoded.exp * 1000 < Date.now()) {
            console.log("Token đã hết hạn!");
            clearAccessToken();
            return <Navigate to="/login" />;
        }
    } catch (error) {
        console.log("Lỗi khi kiểm tra token:", error);
        clearAccessToken();
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};

export default PrivateRoute;