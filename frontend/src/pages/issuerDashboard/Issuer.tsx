import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress, Container, Grid2, Alert, Box, Divider } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useNavigate, useParams } from 'react-router-dom';

// Define an interface for Certificate
interface Certificate {
  id: number;
  CIF: string;
  RazonSocial: string;
  FechaInicio: string;
  FechaFin: string;
  Tecnologia: string;
  Potencia: string;
  status: string;
  tokenOnChainId: string;
}

const Issuer = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { status } = useParams<{ status: string }>();
  const token = localStorage.getItem('authToken');
  
  // Fetch certificates with status from backend
  useEffect(() => {
    const fetchCertificates = async (status: string) => {
      try {
        const response = await fetch(`http://localhost:3000/demand/certificatesWithStatus/${status}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch certificates');
        }

        const data = await response.json();
        setCertificates(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (status) {
      fetchCertificates(status);
    }
  }, [status]);

  // Extract unique companies (RazonSocial)
  const uniqueCompanies = Array.from(new Set(certificates.map((cert) => cert.RazonSocial)));
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mt: 6, mb: 6 }}>
        <VerifiedIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: '#424242',
            mb: 2,
          }}
        >
          Companies with {status} Certificates
        </Typography>
        <Divider sx={{ width: '50%', margin: '0 auto' }} />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && certificates.length === 0 && (
        <Alert severity="info">No certificates available with {status} status.</Alert>
      )}

      {!loading && !error && certificates.length > 0 && (
        <Grid2 container spacing={3}>
          {uniqueCompanies.map((razonSocial, index) => (
            <Grid2 key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                variant="outlined"
                onClick={() => navigate(`/issuer/${status}/${encodeURIComponent(razonSocial)}`)}
                sx={{
                  cursor: 'pointer',
                  minHeight: '375px',
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
                    <img
                      src="../../public/electrify_network_logo.jpg"
                      alt="Company Logo"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <Typography variant="h6" component="div" textAlign="center" sx={{ fontWeight: 'medium' }}>
                    {razonSocial}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      )}
    </Container>
  );
};

export default Issuer;
