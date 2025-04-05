import { post, get, upd } from "./index";

export const login = async (email: string, password: string) => {
    const response = await post("/login", {
        email,
        password,
    }, {
        withCredentials: true
    })
    return response;
};

export const register = async (username: string, password: string, loginIp: string) => {
    const response = await post("/register", {
        username,
        password,
        loginIp
    }, {
        withCredentials: true
    })
    return response;
};

export const getProfile = async () => {
    const response = await get("/profile");
    return response;
}

export const updateProfile = async (data: any) => {
    const response = await upd("/profile", data);
    return response;
}