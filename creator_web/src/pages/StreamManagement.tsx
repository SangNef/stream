import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Input, Pagination, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';

import { createStream, getListStream, updateStream } from '../services';
import { getAccessTokenFromLS, getVietnamTimeString } from '../utils/auth';

interface Stream {
  id: number;
  thumbnail: string;
  stream_url: string;
  status: string;
  title: string;
  start_time: string;
  end_time: string;
  view: number;
  deletedAt: string | null;
  timeLive: number;
}

interface CreateStreamForm {
  title: string;
  stream_url: string;
}

const StreamManagement: React.FC = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalStream, setTotalStream] = useState(0);
  const [newStream, setNewStream] = useState<CreateStreamForm>({
    title: '',
    stream_url: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const accessToken = getAccessTokenFromLS() as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await getListStream(currentPage, pageSize);
        if (response.metadata) {
          setTotalStream(response.metadata.totalStream);
          setStreams(response.metadata.records);
        }
      } catch (error) {
        console.error('Error fetching streams:', error);
      }
    };
    fetchStreams();
  }, [currentPage, pageSize]);

  const handleCreateStream = async () => {
    try {
      if (!thumbnailFile) {
        message.error('Please upload a thumbnail.');
        return;
      }
      setUploadLoading(true);
      const imageFormData = new FormData();
      imageFormData.append('images', thumbnailFile);

      const imageResponse = await axios.post('http://localhost:5000/api/images/upload', imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const imageUrl = imageResponse.data?.metadata?.[0];
      setUploadLoading(false);
      if (!imageUrl) {
        toast.error('Failed to upload image.');
        return;
      }

      const streamFormData = {
        title: newStream.title,
        stream_url: newStream.stream_url,
        thumbnail: imageUrl,
      };
      const response = await createStream(streamFormData);
      if (response.metadata) {
        toast.success('Tạo stream thành công!');
        setStreams((prevStreams) => [...prevStreams, response.metadata]);
        handleCancel();
      }
    } catch (error: any) {
      setUploadLoading(false);
      message.error('Đã có lỗi xảy ra!');
      console.error('Error creating stream:', error);
      if (error.response) {
        console.error('Lỗi từ server:', error.response.data);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStream((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const handleManualUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); 
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    handleCreateStream();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setNewStream({
      title: '',
      stream_url: '',
    });
    setThumbnailFile(null);
  };

  const handleStopStream = async (id: number) => {
    try {
      const dayVN = getVietnamTimeString();
      const res = await updateStream(id, { end_time: dayVN });
      if (res.metadata) {
        setStreams((prevStreams) =>
          prevStreams.map((stream) =>
            stream.id === id ? { ...stream, status: 'stop', end_time: dayVN } : stream
          )
        );
        message.success('Dừng stream thành công!');
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  };

  const columns: ColumnsType<Stream> = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (thumbnail) => <img src={thumbnail} alt="thumbnail" width={50} height={50} />,
    },
    {
      title: 'Stream URL',
      dataIndex: 'stream_url',
      key: 'stream_url',
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          danger
          disabled={record.status === 'stop'}
          onClick={() => handleStopStream(record.id)}
        >
          Stop
        </Button>
      ),
    },
  ];

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Create Stream
      </Button>
      <Table
        columns={columns}
        dataSource={streams}
        pagination={{
          total: totalStream,
          current: currentPage,
          pageSize: pageSize,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Create New Stream"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          placeholder="Title"
          name="title"
          value={newStream.title}
          onChange={handleInputChange}
          style={{ marginBottom: 16 }}
        />
        <Input
          placeholder="Stream URL"
          name="stream_url"
          value={newStream.stream_url}
          onChange={handleInputChange}
          style={{ marginBottom: 16 }}
        />
        <input
          type="file"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
        />
        <Button onClick={handleManualUpload} icon={<UploadOutlined />} loading={uploadLoading}>
          {uploadLoading ? 'Uploading...' : 'Upload Thumbnail'}
        </Button>
        {thumbnailFile && <div style={{ marginTop: 8 }}>Đã chọn: {thumbnailFile.name}</div>}
      </Modal>
    </div>
  );
};

export default StreamManagement;