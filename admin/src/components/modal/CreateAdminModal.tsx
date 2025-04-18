import { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { createAdmin } from "~/api/auth";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const CreateAdminModal = ({ open, onClose, onCreated }: Props) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            if (values.password !== values.confirmPassword) {
                return toast.error("Mật khẩu xác nhận không khớp!");
            }

            setLoading(true);
            const res = await createAdmin({
                email: values.email,
                name: values.name,
                password: values.password,
            });

            if (res.metadata) {
                toast.success("Tạo admin thành công!");
                form.resetFields();
                onClose();
                onCreated();
            }
        } catch (error) {
            toast.error("Lỗi tạo admin!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo Admin Mới"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Tên"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={handleCreate} loading={loading} block>
                        Tạo Admin
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateAdminModal;
