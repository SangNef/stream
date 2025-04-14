import DefaultLayout from "../layouts/DefaultLayout";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import ResetPassword from "../pages/ResetPassword";
import Home from "../pages/Home";
import routes from "../utils/routes";
import StreamManagement from "../pages/StreamManagement";

const publicRoutes = [
    {
        path: routes.login,
        component: Login,
        layout: null
    },
    {
        path: routes.forgotPassword,
        component: ForgotPassword,
        layout: null
    },
    {
        path: routes.resetPassword,
        component: ResetPassword,
        layout: null
    }

]
const privateRoutes = [
    {
        path: routes.home,
        component: Home,
        layout: DefaultLayout,
    },
    {
        path: routes.information,
        component: Profile,
        layout: DefaultLayout,
    },
    {
        path:routes.streamManagement,
        component: StreamManagement,
        layout: DefaultLayout,
    }
   
]
export { privateRoutes, publicRoutes }