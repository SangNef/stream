import HomeIcon from '@mui/icons-material/Home';
export const drawerWidth = 260;
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LiveTvIcon from '@mui/icons-material/LiveTv';
export const menuItemList = [
    {
        label: 'Trang chủ',
        path: '/',
        icon: HomeIcon,
    },
    {
        label: 'Stream',
        path: '/stream-management',
        icon: LiveTvIcon
    },
    {
        label: 'Thông tin',
        path: '/information',
        icon: AccountCircleIcon
    }
]