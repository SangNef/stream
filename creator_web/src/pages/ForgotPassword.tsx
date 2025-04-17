import React, { useState } from 'react';
import { Typography, Input, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGetCode = async () => {
    setLoading(true);
    // try {
    //   const res = await auth.getCode(email)
    //   if (res.data) {
    //     toast.success("Vào email để lấy lại mật khẩu!")
    //     navigate('/reset-password', { state: { email } })
    //   }
    // } catch (error) {
    //   toast.error("Email không chính xác!!!")
    // } finally {
    //   setLoading(false);
    // }
    // Simulate API call for demonstration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success('Một mã xác minh đã được gửi đến email của bạn!');
    navigate('/reset-password', { state: { email } });
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
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography.Title level={5} style={{ marginBottom: '24px' }}>
          Nhập địa chỉ email của bạn
        </Typography.Title>
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '400px', marginBottom: '20px' }}
        />
        <Space style={{ width: '400px', marginTop: '20px', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate('/login')} style={{ width: '180px' }}>
            Quay về Login
          </Button>
          <Button
            type="primary"
            onClick={handleGetCode}
            disabled={email.length === 0}
            loading={loading}
            style={{ width: '180px' }}
          >
            Lấy code
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ForgotPassword;