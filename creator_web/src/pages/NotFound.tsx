import React from 'react';
import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
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
      }}
    >
      <Typography level={1} style={{ fontWeight: 'bold', marginBottom: 16 }}>
        404 Not Found
      </Typography>

      <Typography style={{ marginBottom: 32 }}>
        Your visited page not found. You may go home page.
      </Typography>

      <Button
        type="primary"
        danger
        style={{ padding: '10px 20px', fontWeight: 'bold' }}
        onClick={handleGoHome}
      >
        Back to home page
      </Button>
    </div>
  );
};

export default NotFound;