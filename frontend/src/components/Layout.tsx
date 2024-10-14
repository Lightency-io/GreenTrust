import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import VerticalNavbar from './navbar';
import { Box } from '@mui/material'; // or from your styling system

const Layout: React.FC<{ role: 'demander' | 'auditor' | 'issuer'}> = ({ role }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Persistent Vertical Navbar */}
      <VerticalNavbar role={role} />

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Outlet /> {/* This will render the route-specific content */}
      </Box>
    </Box>
  );
};

export default Layout;
