import { Button, Form, Input } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "~/actions/AuthAction";
import { RootState } from "~/store/AuthStore";

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error: authError, token } = useSelector((state: RootState) => state.auth);
    useEffect(() => {
        document.title = "Đăng nhập";
    }, []);

    useEffect(() => {
        console.log("Token:", token);
        if (token) {
            navigate("/");
        }
    }, [token, navigate]);

    const onFinish = async (values: { email: string; password: string }) => {
        try {
           const res= await dispatch(login({ email: values.email, password: values.password }) as any);
        } catch (err: any) {
            console.error("Login failed:", err.message);
        }
    };

    return (
        <div className="p-8 rounded-lg shadow-lg w-full max-w-xl bg-[#00000022] border border-gray-300">
            <h2 className="text-2xl font-bold text-white mb-6">Đăng nhập</h2>
            {authError && <p className="text-red-500 mb-6">{authError}</p>}
            <Form
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    remember: true,
                }}>
                <Form.Item
                    label={<span style={{ color: "white" }}>Email</span>}
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: "Không được để trống tên tài khoản.",
                        },
                    ]}>
                    <Input placeholder="Vui lòng nhập tên đăng nhập" />
                </Form.Item>

                <Form.Item
                    label={<span style={{ color: "white" }}>Mật khẩu</span>}
                    name="password"
                    rules={[{ required: true, message: "Không được để trống mật khẩu." }]}>
                    <Input.Password placeholder="••••••••" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
