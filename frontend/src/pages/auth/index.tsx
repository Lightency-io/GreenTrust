import React, { useState } from 'react';
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Alert, Button } from "@mui/material";


const AuthPage = () => {

  const {
    connect,
    account,
    network,
    connected,
    disconnect,
    wallet,
    wallets,
    signAndSubmitTransaction,
    signTransaction,
    signMessage,
    signMessageAndVerify,
  } = useWallet();
  const walletAccount = account;
  console.log(walletAccount)

  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and sign up
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    organization: '',
    companyName: '',
    licence: '',
  });
  const [errorMessage, setErrorMessage] = useState(''); // To show any errors

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Toggle between Login and Sign Up
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

  // Render organization or company fields based on the role
  const renderRoleSpecificFields = () => {
    if (formData.role === 'demander') {
      return (
        <div>
          <label>Organization</label>
          <select name="organization" value={formData.organization} onChange={handleInputChange} required>
            <option value="">Select Organization</option>
            <option value="Nexus">Nexus</option>
            <option value="Steg">Steg</option>
            <option value="ENIT">ENIT</option>
          </select>
        </div>
      );
    } else if (formData.role === 'issuer') {
      return (
        <div>
          <label>Organization</label>
          <select name="organization" value={formData.organization} onChange={handleInputChange} required>
            <option value="">Select Organization</option>
            <option value="CNMC">CNMC</option>
            <option value="element2">Element 2</option>
            <option value="element3">Element 3</option>
          </select>
        </div>
      );
    } else if (formData.role === 'auditor') {
      return (
        <div>
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            required
          />
          <label>Licence</label>
          <input
            type="text"
            name="licence"
            value={formData.licence}
            onChange={handleInputChange}
            required
          />
        </div>
      );
    }
    return null;
  };

  // Submit handler for sign-up or login
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("test")
    if (!walletAccount) {
      setErrorMessage('Please connect your wallet to continue.');
      return;
    }
    const apiEndpoint = isLogin ? "http://localhost:3000/auth/signIn" : "http://localhost:3000/auth/signUp";
    const body = isLogin
      ? { email: formData.email, password: formData.password, walletAddress: walletAccount.address } // Sign-in body
      : { // Sign-up body
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyName: formData.companyName || undefined, // Only include if exists
        licence: formData.licence || undefined, // Only include if exists
        organization: formData.organization || undefined, // Only include if exists
        walletAddress: walletAccount.address
      };
console.log(body)
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(data)

      if (!response.ok) {
        setErrorMessage(data.erreur || "Something went wrong.");
        return;
      }


      localStorage.setItem('authToken', data.token)
      // Check the role and navigate accordingly
      const userRole = isLogin ? data.role : formData.role; // Assuming login response contains user data with role

      if (userRole === 'auditor') {
        navigate('/auditor');
      } else if (userRole === 'issuer') {
        navigate('/Dashboard');
      } else if (userRole === 'demander') {
        navigate('/demander');
      } else {
        alert('Unknown role');
      }
      setErrorMessage('');
      alert(isLogin ? 'Login successful!' : 'Sign-up successful!');

    } catch (error) {
      console.log('Error:', error);
      setErrorMessage('Failed to connect to the server. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div><WalletSelector /></div>

        {!isLogin && (
          <div>
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleInputChange} required>
              <option value="">Select Role</option>
              <option value="auditor">Auditor</option>
              <option value="issuer">Issuer</option>
              <option value="demander">Demander</option>
            </select>

            {renderRoleSpecificFields()}
          </div>
        )}

        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <br />
      <button onClick={toggleAuthMode}>
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </button>
    </div>
  );
};

export default AuthPage;
