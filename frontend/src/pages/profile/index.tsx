import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // To decode the JWT token
import { Container, Box, Typography, TextField, Button, Avatar, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CircularProgress from '@mui/material/CircularProgress';

// Interface for JWT token payload
interface DecodedToken {
  user: {
    id: string;
    email: string;
    role: string;
    walletAddress: string;
  };
  iat?: number; // Optional: for expiration timestamp
}

const ProfilePage = () => {
  const [profile, setProfile] = useState({ email: '', role: '', walletAddress: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Function to decode the token and get the profile data
  const getProfileFromToken = () => {
    const token = localStorage.getItem('authToken'); // Assuming the JWT is stored in localStorage
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        console.log(decodedToken);
        return {
          email: decodedToken.user.email,
          role: decodedToken.user.role,
          walletAddress: decodedToken.user.walletAddress,
        };
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    return null;
  };

  useEffect(() => {
    const userProfile = getProfileFromToken();
    if (userProfile) {
      setProfile(userProfile); // Set the profile from the decoded token
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    // Add your logic to save the profile, potentially sending it to the backend.
    setSaving(false);
    setEditing(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Avatar
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            backgroundColor: '#2e7d32',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#fff',
          }}
        >
          {profile.email.charAt(0)}
        </Avatar>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: '#2e7d32', letterSpacing: '0.5px', mb: 3 }}
        >
          {editing ? 'Edit Profile' : 'My Profile'}
        </Typography>
      </Box>
      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: '16px',
          boxShadow: '0px 8px 16px rgba(0,0,0,0.1)',
          backgroundColor: '#f9f9f9',
        }}
      >
        <TextField
          name="email"
          label="Email"
          value={profile.email}
          fullWidth
          disabled
          sx={{
            mb: 3,
            '& .MuiInputBase-input': { fontWeight: 500 },
          }}
        />
        <TextField
          name="role"
          label="Role"
          value={profile.role}
          fullWidth
          disabled
          sx={{
            mb: 3,
            '& .MuiInputBase-input': { fontWeight: 500 },
          }}
        />
        <TextField
          name="walletAddress"
          label="Wallet Address"
          value={profile.walletAddress}
          fullWidth
          disabled
          sx={{
            mb: 3,
            '& .MuiInputBase-input': { fontWeight: 500 },
          }}
        />

        {editing ? (
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveProfile}
              disabled={saving}
              sx={{
                textTransform: 'none',
                borderRadius: '30px',
                px: 4,
                py: 1,
                fontWeight: 'bold',
                backgroundColor: '#2e7d32',
                '&:hover': {
                  backgroundColor: '#256b28',
                },
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        ) : (
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
              sx={{
                textTransform: 'none',
                borderRadius: '30px',
                px: 4,
                py: 1,
                fontWeight: 'bold',
                color: '#2e7d32',
                borderColor: '#2e7d32',
                '&:hover': {
                  backgroundColor: '#e8f5e9',
                  borderColor: '#256b28',
                },
              }}
            >
              Edit Profile
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProfilePage;
