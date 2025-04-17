import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    Table, Button, Input, Space, Tooltip, Modal, Typography, Spin, Image
} from "antd";
import {
    StopOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined
} from "@ant-design/icons";
import { deleteOrRestoreStream, getListStream, getListStreamStop, stopStream } from "~/api/auth";

const { Title, Text } = Typography;
const { Search } = Input;

const StreamManagement = () => {
    const [listStream, setListStream] = useState<any[]>([]);
    const [loading, setLoading] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<"live" | "stop" | "delete" | "restore">("live");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<"stop" | "delete" | "restore" | null>(null);
    const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);

    useEffect(() => {
        fetchLiveStreams();
    }, []);

    const fetchLiveStreams = async () => {
        try {
            const res = await getListStream();
            setListStream(res.metadata.records || []);
        } catch {
            toast.error("Lỗi lấy danh sách stream đang live!");
        }
    };

    const fetchStoppedStreams = async () => {
        try {
            const res = await getListStreamStop();
            setListStream(res.metadata.records || []);
        } catch {
            toast.error("Lỗi lấy danh sách stream đã dừng!");
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const filteredStreams = listStream.filter(
        (stream) =>
            stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stream.users.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenConfirm = (id: number, action: "stop" | "delete" | "restore") => {
        setSelectedStreamId(id);
        setConfirmAction(action);
        setConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
        if (selectedStreamId !== null && confirmAction !== null) {
            await updateStreamStatus(selectedStreamId, confirmAction);
            if (filterStatus === "live") fetchLiveStreams();
            else fetchStoppedStreams();
            setConfirmOpen(false);
        }
    };

    const updateStreamStatus = async (id: number, action: "stop" | "delete" | "restore") => {
        setLoading(id);
        try {
            let res;
            if (action === "stop") {
                res = await stopStream(id);
            } else {
                res = await deleteOrRestoreStream(id);
            }
            if (res?.statusCode === 200) {
                toast.success("Cập nhật trạng thái thành công!");
            }
        } catch {
            toast.error("Lỗi cập nhật trạng thái!");
        } finally {
            setLoading(null);
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Chủ Phòng", dataIndex: ["users", "username"], key: "username" },
        { title: "Title", dataIndex: "title", key: "title" },
        {
            title: "Thumbnail",
            dataIndex: "thumbnail",
            key: "thumbnail",
            render: (text: string, record: any) => (
                <Image
                    width={100}
                    height={100}
                    src={text || "https://png.pngtree.com/png-vector/20190623/ourlarge/pngtree-accountavataruser--flat-color-icon--vector-icon-banner-templ-png-image_1491720.jpg"}
                    alt={record.title}
                    preview={false}
                />
            ),
        },
        {
            title: "Giờ",
            key: "hour",
            render: (text: any, record: any) =>
                new Date(record.start_time).toLocaleTimeString("vi-VN"),
        },
        {
            title: "Ngày",
            key: "date",
            render: (text: any, record: any) =>
                record.start_time?.split("T")[0],
        },
        { title: "Views", dataIndex: "totalViews", key: "totalViews" },
        {
            title: "Trạng thái",
            key: "status",
            render: (text: any, record: any) => {
                let color = "black";
                let label = "Không xác định";

                switch (record.status) {
                    case "live":
                        color = "green";
                        label = "Đang Live";
                        break;
                    case "stop":
                        color = "red";
                        label = "Đã Dừng";
                        break;
                    case "delete":
                        color = "gray";
                        label = "Đã Xóa";
                        break;
                }

                return (
                    <Space>
                        <span style={{ color }}>●</span>
                        {label}
                    </Space>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (text: any, record: any) => {
                return (
                    <Space>
                        {record.status === "live" && (
                            <Tooltip title="Dừng">
                                <Button
                                    icon={loading === record.id ? <Spin size="small" /> : <StopOutlined />}
                                    onClick={() => handleOpenConfirm(record.id, "stop")}
                                    danger
                                    disabled={loading === record.id}
                                />
                            </Tooltip>
                        )}
                        {record.status === "delete" ? (
                            <Tooltip title="Khôi phục">
                                <Button
                                    icon={loading === record.id ? <Spin size="small" /> : <ReloadOutlined />}
                                    onClick={() => handleOpenConfirm(record.id, "restore")}
                                    type="primary"
                                    disabled={loading === record.id}
                                />
                            </Tooltip>
                        ) : record.status === "stop" ? (
                            <Tooltip title="Xóa">
                                <Button
                                    icon={loading === record.id ? <Spin size="small" /> : <DeleteOutlined />}
                                    onClick={() => handleOpenConfirm(record.id, "delete")}
                                    danger
                                    disabled={loading === record.id}
                                />
                            </Tooltip>
                        ) : null}
                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ padding: 16 }}>
            <Title level={4}>Danh Sách Stream</Title>

            <Space style={{ marginBottom: 16 }}>
                <Button
                    type={filterStatus === "live" ? "primary" : "default"}
                    onClick={() => {
                        setFilterStatus("live");
                        fetchLiveStreams();
                    }}
                >
                    Đang Live
                </Button>
                <Button
                    type={filterStatus === "stop" ? "primary" : "default"}
                    onClick={() => {
                        setFilterStatus("stop");
                        fetchStoppedStreams();
                    }}
                >
                    Đã Dừng
                </Button>
                <Search
                    placeholder="Tìm kiếm theo tiêu đề hoặc chủ phòng"
                    allowClear
                    enterButton={<SearchOutlined />}
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
            </Space>

            <Table
                columns={columns}
                dataSource={filteredStreams}
                rowKey="id"
                locale={{ emptyText: "Danh sách trống" }}
            />

            <Modal
                title="Xác nhận hành động"
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onOk={handleConfirmAction}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Text>Bạn có chắc chắn muốn thực hiện hành động này không?</Text>
            </Modal>
        </div>
    );
};

export default StreamManagement;
