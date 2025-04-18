import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Table,
  Switch,
  Typography,
  Button,
  Pagination,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import AdminModal from "~/components/dialog/AdminModal";
import { deleteSoft, getListAdmin, updateProfile } from "~/api/auth";
import CreateAdminModal from "~/components/modal/CreateAdminModal";

interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  is_root: boolean;
  deletedAt: string | null;
}

const AdminManagement = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [listUsers, setListUsers] = useState<User[]>([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    getListUsers();
  }, []);

  const getListUsers = async () => {
    try {
      const res = await getListAdmin();
      setListUsers(res.metadata?.records || []);
    } catch (error) {
      toast.error("Lỗi lấy danh sách người dùng!");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setOpenEditModal(true);
  };

  const handleCloseEdit = () => {
    setOpenEditModal(false);
    setEditingUser(null);
  };

  const handleCloseCreate = () => {
    setOpenCreateModal(false);
  };

  const handleEditUser = async (updatedUser: User) => {
    try {
      const res = await updateProfile(updatedUser.id, updatedUser);
      if (res.metadata) {
        setListUsers((prev) =>
          prev.map((usr) =>
            usr.id === updatedUser.id ? { ...usr, ...updatedUser } : usr
          )
        );
        toast.success("Cập nhật thông tin người dùng thành công!");
      }
    } catch (error) {
      toast.error("Lỗi cập nhật người dùng!");
    }
  };

  const handleToggleStatus = async (id: number, isDelete: number) => {
    try {
      const res = await deleteSoft(id, isDelete);
      if (res.metadata) {
        setListUsers((prev) =>
          prev.map((user) =>
            user.id === id
              ? { ...user, deletedAt: isDelete === 1 ? new Date().toISOString() : null }
              : user
          )
        );
        toast.success(isDelete === 0 ? "Khôi phục admin thành công!" : "Vô hiệu hóa admin thành công!");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái admin!");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (text) => text.split("T")[0],
    },
    {
      title: "Vai trò",
      dataIndex: "is_root",
      render: (is_root) => (is_root ? "Root" : "User"),
    },
    {
      title: "Trạng thái",
      dataIndex: "deletedAt",
      render: (_, record) =>
        record.is_root ? (
          <span style={{ color: "gray" }}>Không thể chặn</span>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={record.deletedAt === null}
              onChange={() =>
                handleToggleStatus(record.id, record.deletedAt === null ? 1 : 0)
              }
            />
          </div>
        ),
    },
  ];

  const paginatedData = listUsers
    .sort((a, b) => a.id - b.id)
    .slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div style={{ width: "100%", padding: 20 }}>
      <Typography.Title level={4}>Danh Sách Người Dùng</Typography.Title>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setOpenCreateModal(true)}
      >
        Tạo Admin
      </Button>
      <Table
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleEdit(record),
        })}
      />
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          current={page}
          pageSize={rowsPerPage}
          total={listUsers.length}
          showSizeChanger
          onChange={(newPage, pageSize) => {
            setPage(newPage);
            setRowsPerPage(pageSize);
          }}
          pageSizeOptions={['5', '10', '20', '50']}
        />
      </div>

      <AdminModal
        open={openEditModal}
        onClose={handleCloseEdit}
        onEditUser={handleEditUser}
        editingUser={editingUser}
      />

      <CreateAdminModal
        open={openCreateModal}
        onClose={handleCloseCreate}
        onCreated={getListUsers}
      />
    </div>
  );
};

export default AdminManagement;
