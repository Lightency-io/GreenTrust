import React from 'react';
import { Card, CardContent, Typography, Container, Grid2, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BlockIcon from '@mui/icons-material/Block';
import VerticalNavbar from '../../components/navbar'

const AuditorSelect = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex' }}>
    
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
          Auditor Dashboard
        </Typography>
      </Box>

      <Grid2 container spacing={4}>
        <Grid2 size={{xs: 12, md: 4}}>
          <Card
            variant="outlined"
            onClick={() => navigate('/auditor/issued')}
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
                Check Issued Certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{xs: 12, md: 4}}>
          <Card
            variant="outlined"
            onClick={() => navigate('/auditor/audited')}
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
                Check Audited Certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{xs: 12, md: 4}}>
          <Card
            variant="outlined"
            onClick={() => navigate('/auditor/rejected')}
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
                Check Rejected Certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Container>
    </div>
  );
};

export default AuditorSelect;
