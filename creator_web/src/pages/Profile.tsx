import React, { useEffect, useState, useRef } from 'react';
import { Typography, Input, Button, Avatar, Space, Row, Col } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { changePassword, getProfile, updateProfile } from '../services';
import axios from 'axios';
import { getAccessTokenFromLS } from '../utils/auth';

interface ProfileData {
  fullname: string;
  username: string;
  avatar: string;
  coin: number;
  totalFollower: number;
  totalFollowed: number;
}

interface PasswordData {
  oldpass: string;
  newpass: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const accessToken = getAccessTokenFromLS() as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullname: '',
    username: '',
    avatar: '',
    coin: 0,
    totalFollower: 0,
    totalFollowed: 0,
  });
  const [profileDataTemp, setProfileDataTemp] = useState<ProfileData>({
    fullname: '',
    username: '',
    avatar: '',
    coin: 0,
    totalFollower: 0,
    totalFollowed: 0,
  });
  const [managePassword, setManagePassword] = useState<PasswordData>({
    oldpass: '',
    newpass: '',
    confirmPassword: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        console.log('Profile Data:', res);
        setProfileData({ ...res.metadata });
        setProfileDataTemp({ ...res.metadata });
        setImagePreview(res.metadata.avatar);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Đã có lỗi xảy ra khi tải thông tin người dùng.');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManagePassword({ ...managePassword, [name]: value });
  };

  const handleResetProfile = () => {
    setProfileData({ ...profileDataTemp });
    setImagePreview(profileDataTemp.avatar);
    setAvatarFile(null);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const triggerAvatarUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmitProfile = async () => {
    try {
      let avatarUrl = profileData.avatar;
      if (avatarFile) {
        setUploadLoading(true);
        const imageFormData = new FormData();
        imageFormData.append('images', avatarFile);
        const imageResponse = await axios.post('http://localhost:5000/api/images/upload', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        avatarUrl = imageResponse.data?.metadata?.[0];
        setUploadLoading(false);
        if (!avatarUrl) {
          toast.error('Lưu thông tin thất bại do không tải được ảnh.');
          return;
        }
      }

      const { username, fullname } = profileData;
      console.log("d",avatarUrl)
      const res = await updateProfile({ username, fullname, avatar: avatarUrl });
      if (res.metadata) {
        toast.success('Thông tin cá nhân đã được cập nhật thành công.');
        setProfileDataTemp({ ...profileData, avatar: avatarUrl });
        setImagePreview(avatarUrl);
        setAvatarFile(null);
      } else {
        toast.error('Cập nhật thông tin cá nhân thất bại.');
      }
    } catch (error: any) {
      setUploadLoading(false);
      console.error('Error updating profile:', error);
      toast.error('Đã có lỗi xảy ra khi cập nhật thông tin.');
      if (error.response) {
        console.error('Lỗi từ server:', error.response.data);
      }
    }
  };

  const isChangePasswordEnabled =
    managePassword.oldpass.length > 0 &&
    managePassword.newpass.length > 0 &&
    managePassword.confirmPassword.length > 0;

  const handleSubmitPassword = async () => {
    if (managePassword.newpass !== managePassword.confirmPassword) {
      toast.error('Mật khẩu mới không trùng khớp!');
      return;
    }
    try {
      const res = await changePassword({
        oldpass: managePassword.oldpass,
        newpass: managePassword.newpass,
      });
      if (res.metadata) {
        toast.success('Mật khẩu đã được thay đổi thành công!');
        setManagePassword({ oldpass: '', newpass: '', confirmPassword: '' });
      } else {
        toast.error('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Đã có lỗi xảy ra khi thay đổi mật khẩu.');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24} justify="space-between">
        <Col xs={24} sm={12}>
          <Typography.Title level={3} style={{ marginBottom: 16 }}>
            Thông tin cá nhân
          </Typography.Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Avatar size={100} src={imagePreview || ''} alt="Avatar" />
              <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleAvatarSelect}
                accept="image/*"
              />
              <Button
                icon={<CameraOutlined />}
                loading={uploadLoading}
                onClick={triggerAvatarUpload}
                style={{ marginLeft: 16 }}
              >
                Đổi Avatar
              </Button>
            </div>
            <Typography style={{ marginLeft: 16 }}>{profileData.username}</Typography>
            <Input
              label="Tên đăng nhập"
              value={profileData.username}
              disabled
              style={{ marginBottom: 16 }}
            />
            <Input
              label="Họ và tên"
              value={profileData.fullname}
              onChange={(e) => handleChange({ target: { name: 'fullname', value: e.target.value } })}
              style={{ marginBottom: 16 }}
            />
            <Space>
              <Typography>Xu: <Typography.Text strong>{profileData.coin}</Typography.Text></Typography>
              <Typography>Người theo dõi: <Typography.Text strong>{profileData.totalFollower}</Typography.Text></Typography>
              <Typography>Đang theo dõi: <Typography.Text strong>{profileData.totalFollowed}</Typography.Text></Typography>
            </Space>
            <Space style={{ marginTop: 20 }}>
              <Button onClick={handleResetProfile}>Hủy Bỏ</Button>
              <Button type="primary" loading={uploadLoading} onClick={handleSubmitProfile}>
                Lưu Thay Đổi
              </Button>
            </Space>
          </Space>
        </Col>

        <Col xs={24} sm={12}>
          <Typography.Title level={3} style={{ marginBottom: 16 }}>
            Thay đổi mật khẩu
          </Typography.Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Input.Password
              placeholder="Mật khẩu hiện tại"
              value={managePassword.oldpass}
              onChange={(e) => handleChangePassword({ target: { name: 'oldpass', value: e.target.value } })}
              style={{ marginBottom: 16 }}
            />
            <Input.Password
              placeholder="Mật khẩu mới"
              value={managePassword.newpass}
              onChange={(e) => handleChangePassword({ target: { name: 'newpass', value: e.target.value } })}
              style={{ marginBottom: 16 }}
            />
            <Input.Password
              placeholder="Xác nhận mật khẩu mới"
              value={managePassword.confirmPassword}
              onChange={(e) => handleChangePassword({ target: { name: 'confirmPassword', value: e.target.value } })}
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" disabled={!isChangePasswordEnabled} onClick={handleSubmitPassword}>
              Đổi Mật Khẩu
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;