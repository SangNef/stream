import { post, get, upd, del } from "./index";

export const login = async (email: string, password: string) => {
    const response = await post("/admin/signin", {
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
export const getListUserRegister = async (param: string) => {
    const response = await get(`/admin/get-list/user/role-user?period=${param}`);
    return response;
};
export const getListCreatorRegister = async (param: string) => {
    const response = await get(`/admin/get-list/user/role-creator?period=${param}`);
    return response;
};
export const getListAdmin = async () => {
    const response = await get(`/admin/get-list/`);
    return response;
};
export const uploadImg = async (data: FormData) => {
    const response = await post(`/images/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  };
export const getProfile = async () => {
    const response = await get("/auth/get-profile");
    return response;
}

export const updateProfile = async (id:number, newUser:any) => {
    const response = await upd(`/admin/update/profile?user_id=${id}`, newUser);
    return response;
}
export const updateProfileAdmin = async ( data:any) => {
    const response = await upd(`/admin/update/profile`, data);
    return response;
}
export const deleteSoft = async (id: number, status: number) => {
    const response = await del(`/admin/delete/${id}?is_delete=${status}`);
    return response;
}
export const getHistory = async (page: number, limit: number) => {
    const response = await get(`/admin/history/get-list?page=${page}&limit=${limit}`);
    return response;
}
export const getTransaction = async (page: number, limit: number) => {
    const response = await get(`/admin/transaction/get-list?page=${page}&limit=${limit}`);
    return response;
}
export const getUserTransactionHistory = async (user_id:number) => {
    const response = await get(`/admin/transaction/history/${user_id}`);
    return response;
}
export const getListStream = async () => {
    const response = await get(`/admin/stream/get-streams-living`);
    return response;
}
export const getListStreamStop = async () => {
    const response = await get(`/admin/stream/get-streams-stop`);
    return response;
}
export const stopStream = async (id: number) => {
    const response = await upd(`/admin/stream/stop-stream/${id}`);
    return response;
}
export const deleteOrRestoreStream = async (id: number) => {
    const response = await del(`/admin/stream/soft-delete-stream/${id}`);
    return response;
}

export const acceptTransaction = async (id: number) => {
    const response = await upd(`/admin/transaction/submit/${id}`);
    return response;
}
export const declineTransaction = async (id: number) => {
    const response = await upd(`/admin/transaction/cancel/${id}`);
    return response;
}
export const changePassword = async (data: any) => {
    const response = await upd(`/auth/change-password`, data);
    return response;
}

