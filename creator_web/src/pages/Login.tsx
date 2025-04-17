import React, { useState } from 'react';
import { Avatar, Button, Form, Input, Typography, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setAccessToken } from '../utils/auth';
import { login } from '../services';

const SignIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await login({
        username,
        password,
      });
      console.log('Login Response:', res.metadata);
      setAccessToken(res.metadata.accessToken);
      toast.success('Đăng nhập thành công');
      navigate('/');
    } catch (error: any) {
      toast.error('Đã có lỗi xảy ra');
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
        backgroundColor: '#f0f2f5',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: 32,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: 360,
        }}
      >
        <Avatar
          size={64}
          icon={<LockOutlined />}
          style={{ backgroundColor: '#1890ff', marginBottom: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}
        />
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Đăng nhập
        </Typography.Title>
        <Form onFinish={handleLogin} noValidate>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
            <Link to="/register">Đăng ký ngay!</Link>
          </Space>
        </Form>
      </div>
    </div>
  );
};

export default SignIn;