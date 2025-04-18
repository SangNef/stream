import React, { useEffect, useState } from "react";
import {
  DatePicker,
  Typography,
  Row,
  Col,
  Statistic,
  Card,
  Spin,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { getUserStreamStats } from "../services";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface StatisticData {
  follower: number;
  donate: {
    sum: number;
    revice: number | null;
  };
  view: number;
}

const Home: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [data, setData] = useState<StatisticData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatistics = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      const res = await getUserStreamStats(
        start && end
          ? { start_date: start, end_date: end }
          : {}
      );
      setData(res.metadata);
      console.log("dd", res)
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu thống kê!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleDateChange = (dates: [Dayjs, Dayjs] | null) => {
    if (dates) {
      setDateRange(dates);
      const [start, end] = dates;
      fetchStatistics(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
    } else {
      setDateRange([null, null]);
      fetchStatistics();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Số liệu thống kê theo thời gian</Title>
      <RangePicker
        value={
          dateRange[0] && dateRange[1] ? [dateRange[0], dateRange[1]] : null
        }
        onChange={handleDateChange}
        style={{ marginBottom: 24 }}
        format="YYYY-MM-DD"
        allowClear
        placeholder={["Chọn ngày bắt đầu", "Chọn ngày kết thúc"]}
      />
      <Spin spinning={loading}>
        {data ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Người theo dõi" value={data.follower} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Tổng quyên góp" value={data.donate.sum} suffix="₫" />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Lượt xem" value={data.view} />
              </Card>
            </Col>
          </Row>
        ) : (
          <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
            Không có dữ liệu.
          </div>
        )}
      </Spin>
    </div>
  );
};

export default Home;
