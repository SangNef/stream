import { Card, Row, Col, Typography, Modal, Input, List } from "antd";
import { useEffect, useState } from "react";
import { getListUserRegister, getListCreatorRegister } from "~/api/auth";

const { Title, Text } = Typography;

const Home = () => {
    const [userStats, setUserStats] = useState({ day: 0, week: 0, month: 0 });
    const [creatorStats, setCreatorStats] = useState({ day: 0, week: 0, month: 0 });

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState<"day" | "week" | "month" | null>(null);
    const [selectedRole, setSelectedRole] = useState<"user" | "creator" | null>(null);
    const [userList, setUserList] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        document.title = "Trang chủ";
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [todayUser, weekUser, monthUser] = await Promise.all([
                    getListUserRegister("day"),
                    getListUserRegister("week"),
                    getListUserRegister("month")
                ]);
                const [todayCreator, weekCreator, monthCreator] = await Promise.all([
                    getListCreatorRegister("day"),
                    getListCreatorRegister("week"),
                    getListCreatorRegister("month")
                ]);

                setUserStats({
                    day: todayUser.metadata.records.length,
                    week: weekUser.metadata.records.length,
                    month: monthUser.metadata.records.length,
                });

                setCreatorStats({
                    day: todayCreator.metadata.records.length,
                    week: weekCreator.metadata.records.length,
                    month: monthCreator.metadata.records.length,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, []);

    const handleOpenModal = async (time: "day" | "week" | "month", role: "user" | "creator") => {
        setSelectedTime(time);
        setSelectedRole(role);
        setModalOpen(true);
        try {
            const response =
                role === "user"
                    ? await getListUserRegister(time)
                    : await getListCreatorRegister(time);
            setUserList(response.metadata.records);
        } catch (error) {
            console.error("Error fetching user list:", error);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setUserList([]);
        setSearchText("");
    };

    const filteredUsers = userList.filter(user =>
        user.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
        user.username.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div style={{ padding: 20 }}>
            <Title level={5}>Số khách hàng đăng kí trong</Title>
            <Row gutter={[16, 16]}>
                {[
                    { label: "Hôm nay", value: userStats.day, time: "day" },
                    { label: "Tuần này", value: userStats.week, time: "week" },
                    { label: "Tháng này", value: userStats.month, time: "month" },
                ].map((item, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card
                            hoverable
                            onClick={() => handleOpenModal(item.time, "user")}
                            style={{ cursor: "pointer" }}
                        >
                            <Text type="secondary">{item.label}</Text>
                            <Title level={2}>{item.value}</Title>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Title level={5} style={{ marginTop: 32 }}>Số creator đăng kí trong</Title>
            <Row gutter={[16, 16]}>
                {[
                    { label: "Hôm nay", value: creatorStats.day, time: "day" },
                    { label: "Tuần này", value: creatorStats.week, time: "week" },
                    { label: "Tháng này", value: creatorStats.month, time: "month" },
                ].map((item, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card
                            hoverable
                            onClick={() => handleOpenModal(item.time, "creator")}
                            style={{ cursor: "pointer" }}
                        >
                            <Text type="secondary">{item.label}</Text>
                            <Title level={2}>{item.value}</Title>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                open={modalOpen}
                onCancel={handleCloseModal}
                footer={null}
                title={`Danh sách ${selectedRole === "creator" ? "creator" : "người dùng"} (${selectedTime === "day" ? "Hôm nay" : selectedTime === "week" ? "Tuần này" : "Tháng này"})`}
            >
                <Input
                    placeholder="Tìm kiếm người dùng"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                {filteredUsers.length > 0 ? (
                    <List
                        dataSource={filteredUsers}
                        renderItem={(user) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={`Fullname: ${user.fullname}`}
                                    description={`Username: ${user.username}`}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text type="secondary">Không có người dùng nào.</Text>
                )}
            </Modal>
        </div>
    );
};

export default Home;
