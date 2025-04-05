import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PrivateRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    return <>{children}</>;
};

export default PrivateRouter;
