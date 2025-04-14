import React, { useState } from 'react';
import { Typography, Input, Button, Space } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast.warning('Mật khẩu không trùng nhau!!!');
      return;
    }
    try {
      // const data = {
      //   email,
      //   password: newPassword,
      //   token
      // };
      // const res = await auth.forgotPassword(data)
      // if (res.data) {
      //   toast.success("Mật khẩu của bạn đã được đặt lại")
      //   setNewPassword("")
      //   setConfirmPassword("")
      //   setToken("")
      //   navigate('/login')
      // }
    } catch (error) {
      toast.error('Email hoặc OTP không chính xác');
    }
  };

  const isSubmit = newPassword.length > 0 && confirmPassword.length > 0 && token.length > 0;

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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography level={5} style={{ marginBottom: '24px' }}>
          Thay đổi mật khẩu
        </Typography>
        <Input.Password
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value.trim())}
          required
          style={{ width: '400px', marginBottom: '20px' }}
        />
        <Input.Password
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value.trim())}
          required
          style={{ width: '400px', marginBottom: '20px' }}
        />
        <Input
          placeholder="Mã"
          value={token}
          onChange={(e) => setToken(e.target.value.trim())}
          required
          style={{ width: '400px', marginBottom: '20px' }}
        />
        <Space style={{ width: '400px', marginTop: '20px' }}>
          <Button onClick={() => navigate('/login')} style={{ width: '180px' }}>
            Quay về Login
          </Button>
          <Button type="primary" onClick={handleSubmit} disabled={!isSubmit} style={{ width: '180px' }}>
            Lưu lại
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ResetPassword;

