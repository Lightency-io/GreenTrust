import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useAuth } from '../Auth/AuthProvider';



interface NavbarProps {
  role: 'demander' | 'auditor' | 'issuer';
  demanderEmail?: string;
}

const VerticalNavbar: React.FC<NavbarProps> = ({ role, demanderEmail }) => {
  const navigate = useNavigate();
  const {logout} = useAuth();


  const handleLogout = () => {
    console.log('Logging out...');
    logout();
    navigate('/auth')

  };
  console.log("test", role)
  const navItems = role === 'demander' ? [
    { text: 'Home', icon: <HomeIcon />, path: `/demander` },
    { text: 'In Progress Certificates', icon: <HourglassEmptyIcon />, path: `/demander/in_progress` },
    { text: 'Issued Certificates', icon: <CheckCircleIcon />, path: `/demander/issued` },
    { text: 'Audited Certificates', icon: <AssignmentTurnedInIcon />, path: `/demander/audited` },
    { text: 'Rejected Certificates', icon: <BlockIcon />, path: `/demander/rejected` },
  ] : [
    { text: 'Home', icon: <HomeIcon />, path: '/auditor' },
    { text: 'Issued Certificates', icon: <CheckCircleIcon />, path: '/auditor/issued' },
    { text: 'Audited Certificates', icon: <AssignmentTurnedInIcon />, path: '/auditor/audited' },
    { text: 'Rejected Certificates', icon: <BlockIcon />, path: '/auditor/rejected' },
  ];

  const bottomMenuItems = [
    { text: 'Profile', icon: <PersonIcon />, path: `/profile` },
    { text: 'Settings', icon: <SettingsIcon />, path: `/settings` },
    { text: 'Logout', icon: <LogoutIcon />, action: handleLogout },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #ddd',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          transition: '0.3s ease',
        },
      }}
    >
      <Box
        sx={{
          padding: 2,
          textAlign: 'center',
          backgroundColor: '#2e7d32',
          color: 'white',
          borderBottom: '1px solid #ddd',
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: 20 }}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Typography>
      </Box>

      <List sx={{ marginTop: 2 }}>
        {navItems.map((item, index) => (
          <ListItemButton
            key={index}
            onClick={() => navigate(item.path)}
            sx={{
              paddingY: 2,
              paddingX: 3,
              borderRadius: '12px',
              marginX: 1,
              marginY: 0.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#e8f5e9',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                color: '#2e7d32',
              },
              '& .MuiListItemIcon-root': {
                color: '#2e7d32',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '16px',
                fontWeight: 'medium',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ marginY: 2 }} />

      <List sx={{ marginTop: 'auto', marginBottom: 2 }}>
        {bottomMenuItems.map((item, index) => (
          <ListItemButton
            key={index}
            onClick={item.action ? item.action : () => navigate(item.path)}
            sx={{
              paddingY: 2,
              paddingX: 3,
              borderRadius: '12px',
              marginX: 1,
              marginY: 0.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#e8f5e9',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                color: '#2e7d32',
              },
              '& .MuiListItemIcon-root': {
                color: '#2e7d32',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '16px',
                fontWeight: 'medium',
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default VerticalNavbar;
