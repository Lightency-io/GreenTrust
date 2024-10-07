import React from 'react'
import ReactDOM from 'react-dom/client'
import { App as AntdApp } from "antd";
import UploadPage from './pages/upload';
import FilePage from './pages/file';
import AuthPage from './pages/auth';
import './main.css'
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/home';
import IssuerDashboard from './pages/issuerDashboard/index';
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import CNMSPage from './pages/cnms';
import Auditor from './pages/auditor/Auditor';
import CertificateDetails from './pages/auditor/CertificateDetails';
import CompanyCertificates from './pages/auditor/CompanyCertificates';
import AuditorSelect from './pages/auditor';
import DemanderDashboard from './pages/demander';
import Demander from './pages/demander/Demander';
import DemanderCompanyCertificates from './pages/demander/DemanderCompanyCertificates';
import DemanderCertificateDetails from './pages/demander/DemanderCertificateDetails';

const wallets = [new PetraWallet(), new MartianWallet];

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/Dashboard",
    element: <IssuerDashboard />,
  },
  {
    path: "/upload",
    element: <UploadPage />,
  },
  {
    path: "/files/:uuid",
    element: <FilePage />,
  },
  {
    path: "/connect-cnms",
    element: <CNMSPage />,
  },
  {
    path: "/auditor",
    element: <AuditorSelect />,
  },
  {
    path: "/auditor/:status",
    element: <Auditor />,
  },
  {
    path: "/auditor/:status/:razonSocial",
    element: <CompanyCertificates />,
  },
  {
    path: "/auditor/:status/:razonSocial/certificate/:id",
    element: <CertificateDetails />,
  },
  {
    path: "/demander",
    element: <DemanderDashboard />,
  },
  {
    path: "/demander/:demanderEmail/:status",
    element: <Demander />,
  },
  {
    path: "/demander/:demanderEmail/:status/:razonSocial",
    element: <DemanderCompanyCertificates />,
  },
  {
    path: "/demander/:demanderEmail/:status/:razonSocial/certificate/:id",
    element: <DemanderCertificateDetails />,
  },
  
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
