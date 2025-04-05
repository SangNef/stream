import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "~/store/AuthStore";
import { Dropdown, Menu } from "antd";
import { UserIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import defaultAdmin from "~/assets/default-admin.jpg";
import { logout } from "~/reducers/AuthReducer";

const Avatar:React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        dispatch(logout());
        navigate("/login");
    };

    const iconClass = "w-5 h-5 inline-block mr-2";

    const menuItems = [
        {
            label: "Tài khoản",
            icon: <UserIcon className={iconClass} />,
            onClick: () => navigate("/profile"),
        },
        {
            label: "Đăng xuất",
            icon: <ArrowRightOnRectangleIcon className={iconClass} />,
            onClick: handleLogout,
        },
    ];

    const menu = (
        <Menu className="!bg-gray-600 !min-w-[160px] !py-1">
            {menuItems.map((item, index) => (
                <Menu.Item key={index} className="!text-gray-300 !font-semibold !px-4 !py-2" onClick={item.onClick}>
                    {item.icon}
                    <span>{item.label}</span>
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <Dropdown overlay={menu} trigger={["click"]}>
            <div className="flex gap-4 items-center cursor-pointer">
                <img src={defaultAdmin} className="w-10 h-10 object-cover rounded-md" alt="Admin Avatar" />
                <div>
                    <h3 className="text-white font-semibold text-base">{user?.name}</h3>
                    <p className="text-gray-300 text-sm">{user?.fullname || user?.role}</p>
                </div>
            </div>
        </Dropdown>
    );
};

export default Avatar;
