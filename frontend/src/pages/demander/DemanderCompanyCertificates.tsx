import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, CircularProgress, Container, Grid2, Alert, Box, Divider } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';

interface Certificate {
  id: number;
  RazonSocial: string;
}

const DemanderCompanyCertificates = () => {
  const { demanderEmail, status, razonSocial } = useParams<{ demanderEmail: string, status: string, razonSocial: string }>();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(`http://localhost:3000/demand/certificatesForDemanderCompanyWithStatus/${demanderEmail}/${status}/${razonSocial}`, {
          method: 'GET',
          headers: {
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

    fetchCertificates();
  }, [razonSocial, status]);

  return (
    <Container>


<Box sx={{ textAlign: 'center', mt: 6, mb: 6 }}>
  <BusinessIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
  <Typography
    variant="h4"
    sx={{
      fontWeight: 600,
      color: '#424242',
      mb: 2,
    }}
  >
    Certificates for {razonSocial}
  </Typography>
  <Divider sx={{ width: '50%', margin: '0 auto' }} />
</Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Grid2 container spacing={3}>
          {certificates.map((certificate) => (
            <Grid2 key={certificate.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                variant="outlined"
                onClick={() => navigate(`/demander/${demanderEmail}/${status}/${razonSocial}/certificate/${certificate.id}`)}
                sx={{
                    cursor: 'pointer',
                    height: "100%",
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
                      src="/1.jpg"
                      alt="Certificate Image"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <Typography variant="h6" component="div" textAlign="left" sx={{ fontWeight: 'medium' }}>
                    Guarantee of Origin - {certificate.id}
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

export default DemanderCompanyCertificates;
