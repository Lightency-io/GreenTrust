import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntdApp } from "antd";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import './main.css';

  // Import AuthProvider

import HomePage from './pages/home';
import AuthPage from './pages/auth';
import IssuerDashboard from './pages/issuerDashboard';
import UploadPage from './pages/upload';
import FilePage from './pages/file';
import CNMSPage from './pages/cnms';
import Auditor from './pages/auditor/Auditor';
import AuditorSelect from './pages/auditor';
import CompanyCertificates from './pages/auditor/CompanyCertificates';
import CertificateDetails from './pages/auditor/CertificateDetails';
import DemanderDashboard from './pages/demander';
import Demander from './pages/demander/Demander';
import DemanderCompanyCertificates from './pages/demander/DemanderCompanyCertificates';
import DemanderCertificateDetails from './pages/demander/DemanderCertificateDetails';
import Layout from './components/Layout'; // Import ProtectedRoute

import { PetraWallet } from "petra-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PontemWalletAdapter, WalletProvider } from "@pontem/aptos-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import ProfilePage from './pages/profile';
import ProtectedRoute from './Auth/ProtectedRoute';
import { AuthProvider } from './Auth/AuthProvider';

const wallets = [new PetraWallet(), new MartianWallet()];
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/connect-cnms",
    element: <CNMSPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  // Auditor routes with persistent navbar
  {
    path: "/auditor",
    element: (
      <ProtectedRoute allowedRoles={['auditor']}>
        <Layout role="auditor" />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <AuditorSelect /> },
      { path: ":status", element: <Auditor /> },
      { path: ":status/:razonSocial", element: <CompanyCertificates /> },
      { path: ":status/:razonSocial/certificate/:id", element: <CertificateDetails /> },
    ],
  },
  // Demander routes with persistent navbar
  {
    path: "/demander",
    element: (
      <ProtectedRoute allowedRoles={['demander']}>
        <Layout role="demander" />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <DemanderDashboard /> },
      { path: "upload", element: <UploadPage/>},
      { path: "files/:uuid", element: <FilePage/>},
      { path: ":status", element: <Demander /> },
      { path: ":status/:razonSocial", element: <DemanderCompanyCertificates /> },
      { path: ":status/:razonSocial/certificate/:id", element: <DemanderCertificateDetails /> },
    ],
  },
  // Protect issuer dashboard
  {
    path: "/Dashboard",
    element: (
      <ProtectedRoute allowedRoles={['issuer']}>
        <IssuerDashboard />
      </ProtectedRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
         {/* Wrap everything inside AuthProvider */}
          <AntdApp>
          <AuthProvider>
            <RouterProvider router={router} />
            </AuthProvider>
          </AntdApp>
        
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
