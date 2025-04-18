import React from "react";
import Avatar from "./Avatar";
import { Link, useLocation } from "react-router-dom";
import {
    AdjustmentsHorizontalIcon,
    CalendarDaysIcon,
    CreditCardIcon,
    HomeIcon,
    UserIcon,
    VideoCameraIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const location = useLocation();

    const iconClass = "w-5 h-5 inline-block mr-2";

    const activeClass =
        "border-l-2 border-l-[#3B7DDD] bg-gradient-to-r from-[rgba(59,125,221,0.1)] to-[hsla(0,0%,100%,0)] !text-gray-200";

    const menuItems = [
        {
            label: "Tổng quan",
            icon: <HomeIcon className={iconClass} />,
            href: "/",
        },
        {
            label: "Quản trị viên",
            icon: <UserIcon className={iconClass} />,
            href: "/admin-management",
        },
        {
            label: "Quản trị người dùng",
            icon: <UserGroupIcon className={iconClass} />,
            href: "/user-management",
        },
        {
            label: "Lịch sử thay đổi",
            icon: <VideoCameraIcon className={iconClass} />,
            href: "/admin-history",
        },
        {
            label: "Giao dịch",
            icon: <CreditCardIcon className={iconClass} />,
            href: "/transaction-management",
        },
        {
            label: "Quản lý Stream",
            icon: <CalendarDaysIcon className={iconClass} />,
            href: "/stream-management",
        },
        {
            label: "Cài đặt",
            icon: <AdjustmentsHorizontalIcon className={iconClass} />,
            href: "/settings",
        }
    ];

    return (
        <div
            className={`bg-[#222E3C] shadow-lg min-h-screen fixed top-0 left-0 w-[264px] transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}>
            <div className="w-[264px] px-6">
                <h2 className="py-4 font-bold text-white text-2xl">Corona</h2>
            </div>
            <div className="px-6 py-3">
                <Avatar />
            </div>
            <ul className="space-y-4 w-full mt-4">
                {menuItems.map((item, index) => (
                    <li
                        key={index}
                        className={`flex items-center space-x-4 py-2 px-6 cursor-pointer font-[400] text-gray-400 hover:text-gray-200 duration-300 ${location.pathname === item.href ? activeClass : ""
                            }`}>
                        <Link to={item.href} className="flex items-center w-full h-full space-x-4">
                            <span>{item.icon}</span>
                            <span className="text-lg">{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
