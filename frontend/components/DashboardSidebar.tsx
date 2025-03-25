import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  AccountTree as PipelineIcon,
  Person as ProfileIcon,
  Telegram as TelegramIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';

interface SidebarItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

export default function DashboardSidebar() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      router.push('/auth/login');
    }
  };

  const menuItems: SidebarItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Pipelines', icon: <PipelineIcon />, path: '/pipeline' },
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
    { text: 'Telegram', icon: <TelegramIcon />, path: '/telegram' },
  ];

  return (
    <Box sx={{ width: 240 }}>
      <List>
        {menuItems.map((item) => (
          <Link key={item.text} href={item.path} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={router.pathname === item.path || router.pathname.startsWith(`${item.path}/`)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: router.pathname === item.path || router.pathname.startsWith(`${item.path}/`)
                      ? 'white'
                      : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
} 