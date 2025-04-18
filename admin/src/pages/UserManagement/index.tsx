import React, { useEffect, useState } from 'react';
import { Button, Input, Table, Space, Pagination, message } from 'antd';
import axios from 'axios';
import { getListUser } from '~/api/auth';

const UserManagement = () => {
    const [originalData, setOriginalData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('user');
    const pageSize = 10;

    const fetchData = async (roleType = role) => {
        try {
            setLoading(true);
            const response = await getListUser(roleType);
            const { records } = response.metadata;
            setOriginalData(records);
            setFilteredData(records);
        } catch (error) {
            message.error('Lỗi khi lấy dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [role]);

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
        if (!value) {
            setFilteredData(originalData);
            return;
        }
        const lower = value.toLowerCase();
        const result = originalData.filter(item =>
            item.fullname?.toLowerCase().includes(lower) ||
            item.username?.toLowerCase().includes(lower)
        );
        setFilteredData(result);
    };

    const handleClickRole = (newRole) => {
        setRole(newRole);
        setPage(1);
        setSearch('');
    };


    const paginatedData = originalData
        .sort((a, b) => a.id - b.id)
        .slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const columns = [
        {
            title: 'Họ tên',
            dataIndex: 'fullname',
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
        },
        {
            title: 'Role',
            dataIndex: 'role',
        },
        {
            title: 'Coin',
            dataIndex: 'coin',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ marginBottom: 16 }}>
                <Button type={role === 'user' ? 'primary' : 'default'} onClick={() => handleClickRole('user')}>
                    User
                </Button>
                <Button type={role === 'creator' ? 'primary' : 'default'} onClick={() => handleClickRole('creator')}>
                    Creator
                </Button>
                <Input.Search
                    placeholder="Tìm kiếm theo tên hoặc username"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                    style={{ width: 300 }}
                />
            </Space>
            <Table
                dataSource={paginatedData}
                columns={columns}
                rowKey="id"
                pagination={false}
                loading={loading}
            />
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <Pagination
                    current={page}
                    total={filteredData.length}
                    pageSize={rowsPerPage}
                    onChange={(newPage, pageSize) => {
                        setPage(newPage);
                        setRowsPerPage(pageSize);
                    }}
                    showSizeChanger
                    pageSizeOptions={['5', '10', '20', '50']}
                />
            </div>
        </div>
    );
};

export default UserManagement;
