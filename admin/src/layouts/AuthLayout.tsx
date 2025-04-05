import React, { FC, ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg__circular__gradient flex flex-col justify-center items-center">
            <Link to="/" className="text-4xl font-bold text-gray-200 mb-6">
                Corona
            </Link>
            {children}
        </div>
    );
};

export default AuthLayout;
