import { Bars3Icon, HomeIcon } from "@heroicons/react/24/outline";
import { Breadcrumb } from "antd";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Avatar from "./Avatar";

interface HeaderProps {
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);
    return (
        <header className="flex justify-between items-center px-6 py-2 bg-[#19222D] shadow-md">
            <div className="flex items-center space-x-4">
                <Bars3Icon onClick={onToggleSidebar} className="h-8 w-8 text-gray-200 cursor-pointer" />
                <Breadcrumb
                    className="text-base custom-breadcrumb"
                    separator={<span className="text-gray-200">/</span>}>
                    <Breadcrumb.Item>
                        <Link to="/" className="!text-gray-200 capitalize">
                            <HomeIcon className="h-5 w-5 inline-block -mt-1" />
                        </Link>
                    </Breadcrumb.Item>
                    {pathnames.map((value, index) => {
                        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                        return (
                            <Breadcrumb.Item key={to}>
                                <p className="!text-gray-200 capitalize !m-0">{value}</p>
                            </Breadcrumb.Item>
                        );
                    })}
                </Breadcrumb>
            </div>
            <div className="cursor-pointer">
                <Avatar />
            </div>
        </header>
    );
};

export default Header;
