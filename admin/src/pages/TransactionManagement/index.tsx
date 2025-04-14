import { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Button,
  Select,
  InputNumber,
  Typography,
  Pagination,
  Space,
} from "antd";
import { toast } from "react-toastify";
import { acceptTransaction, declineTransaction, getTransaction, getUserTransactionHistory } from "~/api/auth";

const { Option } = Select;

interface Transaction {
  id: number;
  type: string;
  value: number;
  is_success: boolean;
  is_cancel: boolean;
  createdAt: string;
  user_rec: {
    fullname: string;
    username: string;
    avatar: string | null;
    role: string;
  };
  user_imp?: {
    id: number;
    fullname: string;
  };
}

const TransactionManagement = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalUser, setOpenModalUser] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dataUserHistory, setDataUserHistory] = useState<any[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [minMoney, setMinMoney] = useState<number | undefined>();
  const [maxMoney, setMaxMoney] = useState<number | undefined>();

  useEffect(() => {
    fetchTransaction();
  }, [page, pageSize]);

  const fetchTransaction = async () => {
    try {
      const res = await getTransaction(page, pageSize);
      if (res.metadata) {
        setTransactions(res.metadata.records);
        setTotalRecords(res.metadata.totalItems);
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
    }
  };

  const handleApproveTransaction = async (id: number) => {
    try {
      const res = await acceptTransaction(id);
      if (res.metadata) {
        setTransactions(prev =>
          prev.map(tx => tx.id === id ? { ...tx, is_success: true, is_cancel: false } : tx)
        );
        toast.success("Giao dịch đã được duyệt thành công!");
      }
    } catch (err) {
      console.error("Lỗi duyệt giao dịch", err);
      toast.error("Lỗi duyệt giao dịch!");
    }
  };

  const handleRejectTransaction = async (id: number) => {
    try {
      const res = await declineTransaction(id);
      if (res.metadata) {
        setTransactions(prev =>
          prev.map(tx => tx.id === id ? { ...tx, is_success: false, is_cancel: true } : tx)
        );
        toast.info("Giao dịch đã bị từ chối!");
      }
    } catch (err) {
      console.error("Lỗi từ chối giao dịch", err);
      toast.error("Lỗi từ chối giao dịch!");
    }
  };

  const handleOpenModal = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTransaction(null);
  };

  const handleOpenModalUser = async (user_id: number) => {
    try {
      const res = await getUserTransactionHistory(user_id);
      if (res.metadata) {
        setDataUserHistory(res.metadata.records);
        setOpenModalUser(true);
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử user:", err);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "success" && tx.is_success) ||
      (statusFilter === "failed" && tx.is_cancel) ||
      (statusFilter === "pending" && !tx.is_success && !tx.is_cancel);

    const matchesType = typeFilter === "" || tx.type === typeFilter;
    const matchesMin = minMoney === undefined || tx.value >= minMoney;
    const matchesMax = maxMoney === undefined || tx.value <= maxMoney;

    return matchesStatus && matchesType && matchesMin && matchesMax;
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (id: number, record: Transaction) => (
        <Button type="link" onClick={() => handleOpenModal(record)}>
          #{id}
        </Button>
      ),
    },
    {
      title: "Người gửi",
      render: (tx: Transaction) => (
        <span
          style={{ cursor: "pointer", color: "black" }}
          onClick={() => handleOpenModalUser(tx.user_imp ? tx.user_imp.id : tx.user_rec.id)}
        >
          {tx.user_imp?.fullname || tx.user_rec.fullname}
        </span>
      ),
    },
    {
      title: "Người nhận",
      render: (tx: Transaction) => (
        <span
          style={{ cursor: "pointer", color: "black" }}
          onClick={() => handleOpenModalUser(tx.user_rec.id)}
        >
          {tx.user_rec.fullname}
        </span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: (type: string) => (type === "withdraw" ? "Rút tiền" : "Nạp tiền"),
    },
    {
      title: "Số tiền",
      dataIndex: "value",
      render: (value: number) => `${value} VNĐ`,
    },
    {
      title: "Trạng thái",
      render: (tx: Transaction) => {
        const color = tx.is_success ? "green" : tx.is_cancel ? "red" : "orange";
        const label = tx.is_success
          ? "Thành công"
          : tx.is_cancel
          ? "Thất bại"
          : "Đang xử lý";
        return <span style={{ color, fontWeight: "bold" }}>{label}</span>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
    {
      title: "Action",
      render: (tx: Transaction) =>
        !tx.is_success && !tx.is_cancel && (
          <Space>
            <Button type="primary" onClick={() => handleApproveTransaction(tx.id)}>
              Duyệt
            </Button>
            <Button danger onClick={() => handleRejectTransaction(tx.id)}>
              Từ chối
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Typography.Title level={4}>Thống kê giao dịch</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Trạng thái"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
        >
          <Option value="">Tất cả</Option>
          <Option value="success">Thành công</Option>
          <Option value="failed">Thất bại</Option>
          <Option value="pending">Đang xử lý</Option>
        </Select>
        <Select
          placeholder="Loại giao dịch"
          style={{ width: 150 }}
          value={typeFilter}
          onChange={setTypeFilter}
        >
          <Option value="">Tất cả</Option>
          <Option value="deposit">Nạp tiền</Option>
          <Option value="withdraw">Rút tiền</Option>
        </Select>
        <InputNumber
          placeholder="Min VNĐ"
          value={minMoney}
          onChange={setMinMoney}
          style={{ width: 120 }}
        />
        <InputNumber
          placeholder="Max VNĐ"
          value={maxMoney}
          onChange={setMaxMoney}
          style={{ width: 120 }}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTransactions}
        pagination={false}
        bordered
      />
<div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
      <Pagination
        current={page}
        pageSize={pageSize}
        total={totalRecords}
        onChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
        showSizeChanger
        pageSizeOptions={["5", "10", "20", "50"]}
      />
</div>
      <Modal
        open={openModal}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
        title="Chi tiết giao dịch"
        footer={<Button onClick={handleCloseModal}>Đóng</Button>}
      >
        {selectedTransaction && (
          <>
            <p>ID: #{selectedTransaction.id}</p>
            <p>Người nhận: {selectedTransaction.user_rec.fullname}</p>
            <p>Loại: {selectedTransaction.type === "withdraw" ? "Rút tiền" : "Nạp tiền"}</p>
            <p>Số tiền: {selectedTransaction.value} VNĐ</p>
            <p>
              Trạng thái:{" "}
              <span
                style={{
                  color: selectedTransaction.is_success
                    ? "green"
                    : selectedTransaction.is_cancel
                    ? "red"
                    : "orange",
                  fontWeight: "bold",
                }}
              >
                {selectedTransaction.is_success
                  ? "Thành công"
                  : selectedTransaction.is_cancel
                  ? "Thất bại"
                  : "Đang xử lý"}
              </span>
            </p>
            <p>Ngày tạo: {new Date(selectedTransaction.createdAt).toLocaleString()}</p>
          </>
        )}
      </Modal>

      <Modal
        open={openModalUser}
        onCancel={() => setOpenModalUser(false)}
        title="Lịch sử giao dịch người dùng"
        footer={null}
      >
        {dataUserHistory.length > 0 ? (
          <ul>
            {dataUserHistory.map((tx: any) => (
              <li key={tx.id}>
                #{tx.id} - {tx.type} - {tx.value} VNĐ -{" "}
                {new Date(tx.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có dữ liệu</p>
        )}
      </Modal>
    </div>
  );
};

export default TransactionManagement;
