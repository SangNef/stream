import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Input, Button, Typography, Space } from 'antd';

const { Title } = Typography;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');

    const handleGetCode = async () => {
        try {
            // const res = await getCode(email);
            if (res.data) {
                toast.success("Vào email để lấy lại mật khẩu!");
                navigate('/reset-password', { state: { email } });
            }
        } catch (error) {
            toast.error("Email không chính xác!!!");
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f0f0f0',
            }}
        >
            <div
                style={{
                    backgroundColor: '#ffffff',
                    padding: 40,
                    borderRadius: 8,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Title level={4} style={{ marginBottom: 30 }}>
                    Nhập địa chỉ email của bạn
                </Title>

                <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: 400, marginBottom: 20 }}
                    required
                />

                <Space style={{ marginTop: 20 }}>
                    <Button
                        type="primary"
                        danger
                        onClick={() => navigate('/login')}
                        style={{ width: 180 }}
                    >
                        Quay về Login
                    </Button>
                    <Button
                        type="primary"
                        disabled={!email}
                        onClick={handleGetCode}
                        style={{ width: 180 }}
                    >
                        Lấy code
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default ForgotPassword
