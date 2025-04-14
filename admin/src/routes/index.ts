import AuthLayout from "~/layouts/AuthLayout";
import Login from "~/pages/Auth/Login";
import PublicRouter from "./PublicRouter";
import Home from "~/pages/Home";
import MainLayout from "~/layouts/MainLayout";
import PrivateRouter from "./PrivateRouter";
import AdminManagement from "~/pages/AdminManagement";
import AdminHistory from "~/pages/AdminHistory";
import TransactionManagement from "~/pages/TransactionManagement";
import StreamManagement from "~/pages/StreamManagement";
import Profile from "~/pages/Profile";
import Setting from "~/pages/Setting";
import ForgotPassword from "~/pages/ForgotPassword";

export const routes = [
    {
        path: "/login",
        Component: Login,
        Layout: AuthLayout,
        RouteType: PublicRouter
    },
    {
        path: "/",
        Component: Home,
        Layout: MainLayout,
        RouteType: PrivateRouter
    },
    {
        path: "/admin-management",
        Component: AdminManagement,
        Layout: MainLayout,
        RouteType: PrivateRouter
    },
    {
        path: "/admin-history",
        Component: AdminHistory,
        Layout: MainLayout,
        RouteType: PrivateRouter
    },
    {
        path: "/transaction-management",
        Component: TransactionManagement,
        Layout: MainLayout,
        RouteType: PrivateRouter
    },
    {
        path: "/stream-management",
        Component: StreamManagement,
        Layout: MainLayout,
        RouteType: PrivateRouter
    },
    {
        path: "/profile",
        Component: Profile,
        Layout: MainLayout,
        RouteType: PrivateRouter
    },
    {
        path: "/settings",
        Component: Setting,
        Layout: MainLayout,
        RouteType: PrivateRouter
    },
    {
        path: "/forgot-password",
        Component: ForgotPassword,
        Layout: MainLayout,
        RouteType: PublicRouter
    }
]