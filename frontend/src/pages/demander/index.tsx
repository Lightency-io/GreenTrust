import React from 'react';
import { Card, CardContent, Typography, Container, Grid2, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BlockIcon from '@mui/icons-material/Block';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {jwtDecode} from 'jwt-decode';



interface DecodedToken {
    user: {
      id: string;
      email: string;
      role: string;
      walletAddress: string;
    };
    iat?: number; // Optional: for expiration timestamp
  }

const DemanderDashboard = () => {
  const navigate = useNavigate();


  const getCurrentUser = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
  
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      return decodedToken; // This will contain user info (e.g., userId, email, etc.)
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const demanderEmail = getCurrentUser()?.user.email
  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mt: 6, mb: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: '#424242',
            mb: 2,
          }}
        >
          Demander Dashboard
        </Typography>
      </Box>

        {/* Centered Button for Demanding Certificates */}
        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: '20px',
              fontWeight: 'bold',
              color: '#2e7d32',
              borderColor: '#2e7d32',
              padding: '10px 30px',
              '&:hover': {
                backgroundColor: '#e8f5e9',
                borderColor: '#1b5e20',
              },
            }}
            onClick={() => navigate('/upload')}
          >
            Demand Certificates
          </Button>
        </Box>
      <Grid2 container spacing={4}>
      <Grid2 size={{ xs: 12, md: 3 }}>
          <Card
            variant="outlined"
            onClick={() => navigate(`/demander/in_progress`)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
              },
              borderRadius: '12px',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <HourglassEmptyIcon sx={{ fontSize: 50, color: '#ffa726' }} />
              </Box>
              <Typography variant="h6" component="div" textAlign="center" sx={{ fontWeight: 'medium' }}>
                View In Progress Certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 3 }}>
          <Card
            variant="outlined"
            onClick={() => navigate(`/demander/issued`)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
              },
              borderRadius: '12px',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <VerifiedIcon sx={{ fontSize: 50, color: '#2e7d32' }} />
              </Box>
              <Typography variant="h6" component="div" textAlign="center" sx={{ fontWeight: 'medium' }}>
                View Issued Certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 3 }}>
          <Card
            variant="outlined"
            onClick={() => navigate(`/demander/audited`)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
              },
              borderRadius: '12px',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <AssignmentTurnedInIcon sx={{ fontSize: 50, color: '#3f51b5' }} />
              </Box>
              <Typography variant="h6" component="div" textAlign="center" sx={{ fontWeight: 'medium' }}>
                View Audited Certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 3 }}>
          <Card
            variant="outlined"
            onClick={() => navigate(`/demander/rejected`)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
              },
              borderRadius: '12px',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <BlockIcon sx={{ fontSize: 50, color: '#f44336' }} />
              </Box>
              <Typography variant="h6" component="div" textAlign="center" sx={{ fontWeight: 'medium' }}>
                View Rejected Certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid2>


      </Grid2>
    </Container>
  );
};

export default DemanderDashboard;
