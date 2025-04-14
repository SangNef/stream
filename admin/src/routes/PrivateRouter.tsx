import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
type JwtPayload = {
    exp: number;
    [key: string]: any; 
};

const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true; 
    }
};

const PrivateRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    const [checkingToken, setCheckingToken] = React.useState(true);

useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || isTokenExpired(token)) {
        localStorage.removeItem("accessToken");
        navigate("/login");
    } else {
        setCheckingToken(false);
    }
}, [navigate]);

if (checkingToken) return null;

    return <>{children}</>;
};

export default PrivateRouter;
