import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                textAlign: 'center',
                backgroundColor: '#fff',
                padding: 20,
            }}
        >
            <Title level={1} style={{ fontWeight: 'bold', marginBottom: 16 }}>
                404 Not Found
            </Title>

            <Text style={{ marginBottom: 32 }}>
                Your visited page not found. You may go home page.
            </Text>

            <Button
                type="primary"
                danger
                onClick={handleGoHome}
                style={{ padding: '10px 20px', fontWeight: 'bold' }}
            >
                Back to home page
            </Button>
        </div>
    );
};

export default NotFound;
