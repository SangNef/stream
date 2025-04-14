import { useEffect, useRef, useState } from 'react';
import { Row, Col, Input, Button, Typography, Avatar, Upload, message, Form } from 'antd';
import { UploadOutlined, CameraOutlined } from '@ant-design/icons';
import { changePassword, getProfile, updateProfile, updateProfileAdmin } from '~/api/auth';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getAccessTokenFromLS } from '~/utils';

const { Title } = Typography;

const Profile = () => {
    const accessToken = getAccessTokenFromLS() as string;

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        avatar: ''
    });
    const [profileDataTemp, setProfileDataTemp] = useState({
        name: '',
        email: '',
        avatar: ''
    });
    const [managePassword, setManagePassword] = useState({
        oldpass: '',
        newpass: '',
        confirmPassword: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleChangePassword = (e: any) => {
        const { name, value } = e.target;
        setManagePassword({ ...managePassword, [name]: value });
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                setProfileData({
                    email: res.metadata.email,
                    avatar: res.metadata.avatar,
                    name: res.metadata.name
                });
                setProfileDataTemp({
                    email: res.metadata.email,
                    avatar: res.metadata.avatar,
                    name: res.metadata.name
                });
            } catch (error) {
                message.error("Đã có lỗi xảy ra!!!");
            }
        };
        fetchProfile();
    }, []);

    const isChangePass = managePassword.confirmPassword.length > 0 && managePassword.newpass.length > 0 || managePassword.oldpass.length > 0;

    const handleChangePass = async () => {
        if (managePassword.newpass !== managePassword.confirmPassword) {
            message.error("Mật khẩu mới không trùng nhau!!!");
            return;
        }
        try {
            const { confirmPassword, ...passwordData } = managePassword;
            const res = await changePassword(passwordData);
            if (res.metadata) {
                message.success("Thay đổi mật khẩu thành công!");
            }
        } catch (error) {
            message.error("Mật khẩu hiện tại không đúng!!!");
        }
    };

    const resetProfile = () => {
        setProfileData({ ...profileDataTemp });
    };
    const handleSubmit = async () => {
        try {
          let avatarUrl = profileData.avatar;
          if (avatarFile) {
            setUploadLoading(true);
            const imageFormData = new FormData();
            imageFormData.append('images', avatarFile);
            const imageResponse = await axios.post('http://localhost:5200/api/images/upload', imageFormData, {
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
    
          const {email, ...dataSubmit } = profileData;
          const newData={...dataSubmit, avatar: avatarUrl};
          console.log("d",avatarUrl)
          const res = await updateProfileAdmin(newData);
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
    // const handleSubmit = async () => {
    //     try {
    //         const { email, ...dataSubmit } = profileData;
    //         const res = await updateProfileAdmin(dataSubmit);
    //         if (res.metadata) {
    //             message.success("Thay đổi thông tin thành công");
    //         }
    //     } catch (error) {
    //         message.error("Thay đổi thông tin thất bại");
    //     }
    // };
    const triggerAvatarUpload = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      };
    const handleFileChange = async (file: any) => {
        const imagePreviewUrl = URL.createObjectURL(file);
        setImagePreview(imagePreviewUrl);

        const apiKey = '8fa2413a74f1c55a37809a8af17e20fc';
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setProfileData({
                    ...profileData,
                    avatar: data.data.url,
                });
                message.success("Cập nhật ảnh đại diện thành công!");
            } else {
                message.error("Lỗi khi tải lên ảnh đại diện.");
            }
        } catch (error) {
            message.error("Đã có lỗi xảy ra khi upload ảnh.");
        }

        return false; // Prevent default upload behavior
    };
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setAvatarFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
      };
    return (
        <div style={{ padding: 24 }}>
            <Row gutter={32}>
                <Col xs={24} md={12}>
                    <Title level={4}>Thông tin cá nhân</Title>
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
                    <Form layout="vertical">
                        <Form.Item label="Email">
                            <Input value={profileData.email} disabled />
                        </Form.Item>
                        <Form.Item label="Họ và tên">
                            <Input name="name" value={profileData.name} onChange={handleChange} />
                        </Form.Item>
                    </Form>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Button onClick={resetProfile}>Hủy Bỏ</Button>
                        <Button type="primary" onClick={handleSubmit}>Lưu lại</Button>
                    </div>
                </Col>
                <Col xs={24} md={12}>
                    <Title level={4}>Thay đổi mật khẩu</Title>
                    <Form layout="vertical">
                        <Form.Item label="Mật khẩu hiện tại">
                            <Input.Password name="oldpass" value={managePassword.oldpass} onChange={handleChangePassword} />
                        </Form.Item>
                        <Form.Item label="Mật khẩu mới">
                            <Input.Password name="newpass" value={managePassword.newpass} onChange={handleChangePassword} />
                        </Form.Item>
                        <Form.Item label="Xác nhận mật khẩu mới">
                            <Input.Password name="confirmPassword" value={managePassword.confirmPassword} onChange={handleChangePassword} />
                        </Form.Item>
                    </Form>
                    <Button type="primary" onClick={handleChangePass} disabled={!isChangePass}>
                        Cập nhật mật khẩu
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
