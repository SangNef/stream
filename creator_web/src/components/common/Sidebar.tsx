import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { Fragment, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import DialogConfirm from '../dialog/DialogConfirm';
import { drawerWidth, menuItemList } from '../../utils/constant';
interface Props {
    window?: () => Window;
}

const Sidebar = (props: Props) => {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [openDialog, setOpenDialog] = useState(false);
    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const handleLogout = () => {
        navigate('/login');
        localStorage.clear();
    };

    const drawer = (
        <div>
            <List
                sx={{
                    px: 2,
                    mt: 4,
                }}
            >
                {menuItemList.map(
                    (menu, index) =>
                        <Fragment key={index}>
                            <ListItem
                                key={index}
                                disablePadding
                                onClick={() => navigate(menu.path)}
                                sx={{
                                    borderRadius: '8px',
                                    backgroundColor:
                                        location.pathname === menu.path ||
                                            (location.pathname.includes(menu.path) &&
                                                menu.path !== '/')
                                            ? '#F2F5FE'
                                            : 'inherit',
                                    '.MuiSvgIcon-root': {
                                        color:
                                            location.pathname === menu.path ||
                                                (location.pathname.includes(menu.path) &&
                                                    menu.path !== '/')
                                                ? '#4169F6'
                                                : 'inherit',
                                    },
                                    '.MuiListItemText-root': {
                                        color:
                                            location.pathname === menu.path ||
                                                (location.pathname.includes(menu.path) &&
                                                    menu.path !== '/')
                                                ? '#4169F6'
                                                : 'inherit',
                                    },
                                    '&:hover': {
                                        backgroundColor: '#F2F5FE',
                                        '.MuiSvgIcon-root': {
                                            color: '#4169F6',
                                        },
                                        '.MuiListItemText-root': {
                                            color: '#4169F6',
                                        },
                                    },
                                }}
                            >
                                <ListItemButton>
                                    <ListItemIcon>{<menu.icon />}</ListItemIcon>
                                    <ListItemText primary={menu.label} />
                                </ListItemButton>
                            </ListItem>

                        </Fragment>
                )}
            </List>
        </div>
    );

    // Remove this const when copying and pasting into your project.
    const container =
        window !== undefined ? () => window().document.body : undefined;

    return (
        <>
            <AppBar
                position='fixed'
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: '#fff',
                    boxShadow: 'none',
                }}
            >
                <Toolbar>
                    <IconButton
                        color='inherit'
                        aria-label='open drawer'
                        edge='start'
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box
                component='nav'
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label='mailbox folders'
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    container={container}
                    variant='temporary'
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant='permanent'
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        },
                    }}
                    open
                >
                    {drawer}
                    <Box sx={{ px: 2, borderTop: '1px solid #E0E0E0', py: 2 }}>
                        <ListItem
                            disablePadding
                            onClick={handleOpenDialog}
                            sx={{
                                borderRadius: '8px',
                                '&:hover': {
                                    backgroundColor: '#F2F5FE',
                                    '.MuiSvgIcon-root': {
                                        color: '#4169F6',
                                    },
                                    '.MuiListItemText-root': {
                                        color: '#4169F6',
                                    },
                                },
                            }}
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    <LogoutIcon />
                                </ListItemIcon>
                                <ListItemText primary={'Logout'} />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                </Drawer>
            </Box>
            <DialogConfirm
                open={openDialog}
                title='Do you want to logout?'
                handleClose={handleCloseDialog}
                handleConfirm={handleLogout}
            />
        </>
    );
};

export default Sidebar;