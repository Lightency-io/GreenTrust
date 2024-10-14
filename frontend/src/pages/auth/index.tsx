import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Alert, Button, Box, TextField, Typography, MenuItem, CircularProgress } from '@mui/material';
import { useAuth } from '../../Auth/AuthProvider';
import "./index.css"

const AuthPage = () => {
  const { connect, account, connected } = useWallet();
  const walletAccount = account;
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    organization: '',
    companyName: '',
    licence: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      role: '',
      organization: '',
      companyName: '',
      licence: '',
    });
  };

  const renderRoleSpecificFields = () => {
    if (formData.role === 'demander') {
      return (
        <TextField
          select
          name="organization"
          label="Organization"
          value={formData.organization}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="Nexus">Nexus</MenuItem>
          <MenuItem value="Steg">Steg</MenuItem>
          <MenuItem value="ENIT">ENIT</MenuItem>
        </TextField>
      );
    } else if (formData.role === 'issuer') {
      return (
        <TextField
          select
          name="organization"
          label="Organization"
          value={formData.organization}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="CNMC">CNMC</MenuItem>
          <MenuItem value="element2">Element 2</MenuItem>
          <MenuItem value="element3">Element 3</MenuItem>
        </TextField>
      );
    } else if (formData.role === 'auditor') {
      return (
        <>
          <TextField
            name="companyName"
            label="Company Name"
            value={formData.companyName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="licence"
            label="Licence"
            value={formData.licence}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
        </>
      );
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!walletAccount) {
      setErrorMessage('Please connect your wallet to continue.');
      setLoading(false);
      return;
    }

    const apiEndpoint = isLogin ? "http://localhost:3000/auth/signIn" : "http://localhost:3000/auth/signUp";
    const body = isLogin
      ? { email: formData.email, password: formData.password, walletAddress: walletAccount.address }
      : {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          companyName: formData.companyName || undefined,
          licence: formData.licence || undefined,
          organization: formData.organization || undefined,
          walletAddress: walletAccount.address,
        };

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.erreur || "Something went wrong.");
        setLoading(false);
        return;
      }

      login(data.token);
      if (data.role === 'auditor') {
        navigate('/auditor');
      } else if (data.role === 'issuer') {
        navigate('/issuer');
      } else if (data.role === 'demander') {
        navigate('/demander');
      } else {
        alert('Unknown role');
      }
      setErrorMessage('');
      alert(isLogin ? 'Login successful!' : 'Sign-up successful!');
    } catch (error) {
      setErrorMessage('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 480,
        mx: 'auto',
        my: 5,
        p: 4,
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: '#2e7d32' }}>
        {isLogin ? 'Login' : 'Sign Up'}
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
          sx={{
            '& .MuiInputLabel-root': { color: '#2e7d32' },
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': { borderColor: '#2e7d32' },
            },
          }}
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
          sx={{
            '& .MuiInputLabel-root': { color: '#2e7d32' },
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': { borderColor: '#2e7d32' },
            },
          }}
        />
        <Box display="flex" justifyContent="center"
          sx={{
            mt: 2,
            mb: 3,
            p: 2,
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            '& .wallet-adapter-selector-button': {
              backgroundColor: '#2e7d32',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#1b5e20',
              },
            },
          }}
        >
          <WalletSelector  />
        </Box>

        {!isLogin && (
          <>
            <TextField
              select
              name="role"
              label="Role"
              value={formData.role}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              sx={{
                '& .MuiInputLabel-root': { color: '#2e7d32' },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: '#2e7d32' },
                },
              }}
            >
              <MenuItem value="auditor">Auditor</MenuItem>
              <MenuItem value="issuer">Issuer</MenuItem>
              <MenuItem value="demander">Demander</MenuItem>
            </TextField>
            {renderRoleSpecificFields()}
          </>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mt: 3,
            py: 1.5,
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: '#2e7d32',
            '&:hover': {
              backgroundColor: '#1b5e20',
            },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : isLogin ? 'Login' : 'Sign Up'}
        </Button>
      </form>
      <Button
        onClick={toggleAuthMode}
        fullWidth
        sx={{
          mt: 3,
          textTransform: 'none',
          fontWeight: 'bold',
          color: '#2e7d32',
        }}
      >
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </Button>
    </Box>
  );
};

export default AuthPage;
