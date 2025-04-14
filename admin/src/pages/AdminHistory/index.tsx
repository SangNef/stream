import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Button,
  Pagination,
  DatePicker,
  Space,
  Input,
} from "antd";
import { DownOutlined, UpOutlined, SearchOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { getHistory } from "~/api/auth";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AdminHistoryItem {
  id: number;
  action: string;
  model: string;
  createdAt: string;
  admins?: {
    name?: string;
  };
  init_value: string;
  change_value: string;
}

const AdminHistory = () => {
  const [history, setHistory] = useState<AdminHistoryItem[]>([]);
  const [filteredData, setFilteredData] = useState<AdminHistoryItem[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    action: "",
    model: "",
    dateRange: [] as [string, string] | [],
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory(page, rowsPerPage);
        if (response.metadata) {
          setTotalRecords(response.metadata.totalItems);
          setHistory(response.metadata.records);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, [page, rowsPerPage]);

  useEffect(() => {
    let data = [...history];

    if (filters.action) {
      data = data.filter((item) =>
        item.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    if (filters.model) {
      data = data.filter((item) =>
        item.model.toLowerCase().includes(filters.model.toLowerCase())
      );
    }

    if (filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      data = data.filter((item) => {
        const date = dayjs(item.createdAt);
        return date.isAfter(dayjs(start)) && date.isBefore(dayjs(end));
      });
    }

    setFilteredData(data);
  }, [filters, history]);

  const toggleRow = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const columns: ColumnsType<AdminHistoryItem> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: (
        <Space>
          Hành động
          <Input
            placeholder="Lọc hành động"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, action: e.target.value }))
            }
            allowClear
            style={{ width: 120 }}
          />
        </Space>
      ),
      dataIndex: "action",
      key: "action",
      render: (text: string) => (
        <span style={{ textTransform: "capitalize" }}>{text}</span>
      ),
    },
    {
      title: (
        <Space>
          Model
          <Input
            placeholder="Lọc model"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, model: e.target.value }))
            }
            allowClear
            style={{ width: 120 }}
          />
        </Space>
      ),
      dataIndex: "model",
      key: "model",
    },
    {
      title: (
        <Space>
          Thời gian
          <RangePicker
            onChange={(dates, dateStrings) =>
              setFilters((prev) => ({
                ...prev,
                dateRange:
                  dateStrings[0] && dateStrings[1]
                    ? [dateStrings[0], dateStrings[1]]
                    : [],
              }))
            }
          />
        </Space>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => format(new Date(text), "yyyy-MM-dd HH:mm:ss"),
    },
    {
      title: "Admin",
      dataIndex: ["admins", "name"],
      key: "admin",
      render: (text: string | undefined) => text || "N/A",
    },
    {
      title: "Chi tiết",
      key: "expand",
      render: (_: any, record: AdminHistoryItem) => (
        <Button
          type="text"
          icon={expandedRow === record.id ? <UpOutlined /> : <DownOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            toggleRow(record.id);
          }}
        />
      ),
    },
  ];

  const expandedRowRender = (record: AdminHistoryItem) => (
    <div style={{ background: "#f9f9f9", padding: 16 }}>
      <strong>Giá trị ban đầu:</strong>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#f5f5f5",
          padding: 8,
          borderRadius: 4,
        }}
      >
        {JSON.stringify(JSON.parse(record.init_value), null, 2)}
      </pre>

      <strong>Thay đổi:</strong>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#f5f5f5",
          padding: 8,
          borderRadius: 4,
        }}
      >
        {JSON.stringify(JSON.parse(record.change_value), null, 2)}
      </pre>
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Title level={4}>Lịch Sử Hoạt Động Của Admin</Title>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={false}
        expandable={{
          expandedRowRender,
          expandedRowKeys: expandedRow ? [expandedRow] : [],
          onExpand: (_, record) => toggleRow(record.id),
        }}
      />
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          current={page}
          total={totalRecords}
          pageSize={rowsPerPage}
          onChange={(p, pageSize) => {
            setPage(p);
            setRowsPerPage(pageSize || 10);
          }}
          showSizeChanger
          pageSizeOptions={["5", "10", "20", "50"]}
        />
      </div>
    </div>
  );
};

export default AdminHistory;
