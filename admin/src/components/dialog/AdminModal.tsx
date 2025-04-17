import { useState, useCallback, useEffect } from 'react';
import { Modal, Input, Checkbox, Upload, Typography, Button, Form, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadImg } from '~/api/auth';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  onEditUser: (user: any) => void;
  editingUser?: any | null;
}

const AdminModal: React.FC<AdminModalProps> = ({ open, onClose, onEditUser, editingUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
    name: '',
    is_root: false,
  });

  useEffect(() => {
    if (open && editingUser) {
      setUserData({
        email: editingUser.email || '',
        name: editingUser.name || '',
        is_root: editingUser.is_root || false,
      });
      setIsEditing(false);
    }
  }, [open, editingUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditing(true);
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: any) => {
    setIsEditing(true);
    setUserData(prev => ({ ...prev, is_root: e.target.checked }));
  };
  const handleSubmit = async () => {
    onEditUser({
      id: editingUser.id,
      ...userData,
    });

    setUserData({ email: '', name: '', is_root: false });
    setIsEditing(false);
    onClose();
  };

  return (
    <Modal
      title="Thông tin người dùng"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="edit" onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>,
        <Button key="save" type="primary" onClick={handleSubmit} disabled={!isEditing}>
          Lưu
        </Button>,
        <Button key="cancel" onClick={onClose}>Thoát</Button>,
      ]}
    >
      <Typography.Paragraph>
        Vui lòng điền đầy đủ thông tin bên dưới và chọn ảnh đại diện.
      </Typography.Paragraph>
      <Form layout="vertical">
        <Form.Item label="Email">
          <Input
            name="email"
            value={userData.email}
            readOnly
            disabled
          />
        </Form.Item>
        <Form.Item label="Tên người dùng">
          <Input
            name="name"
            value={userData.name}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={userData.is_root}
            onChange={handleCheckboxChange}
          >
            Quyền quản trị viên (is_root)
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminModal;
