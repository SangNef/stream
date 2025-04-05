import AuthLayout from "~/layouts/AuthLayout";
import Login from "~/pages/Auth/Login";
import PublicRouter from "./PublicRouter";
import Home from "~/pages/Home";
import MainLayout from "~/layouts/MainLayout";
import PrivateRouter from "./PrivateRouter";

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
    }
]