import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Container,
  Alert,
  Box,
  Grid2,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedIcon from '@mui/icons-material/Verified';
import ChainIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useWallet } from "@aptos-labs/wallet-adapter-react";

import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey, AccountAddress, InputGenerateTransactionPayloadData, TransactionWorkerEventsEnum, MoveVector } from "@aptos-labs/ts-sdk";
import { HexString } from "aptos";

const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

const privateKey = new Ed25519PrivateKey(import.meta.env.VITE_PRIVATE_KEY!);
const address = AccountAddress.from(import.meta.env.VITE_ACCOUNT_ADDRESS!);
const accountAdmin = Account.fromPrivateKey({ privateKey, address });

const truncateAddress = (address: string, startLength = 6, endLength = 6) => {
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('On-Chain Address copied to clipboard');
  });
};

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
  transferredToDemander: boolean;
}

function stringToHex(str: string): string {
  return str
    .split('')
    .map((char) => char.charCodeAt(0).toString(16))
    .join("");
}


const DemanderCertificateDetails = () => {
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

  const { demanderEmail, razonSocial, id } = useParams<{demanderEmail:string, razonSocial:string, id: string }>();
  const navigate = useNavigate(); // Initialize navigate for redirection

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatedCertificate, setUpdatedCertificate] = useState<Certificate | null>(null);

  const token = localStorage.getItem('authToken')


  // Function to update modified fields of the certificate on-chain
const updateCertificateOnChain = async (
    originalCertificate: Certificate,
    updatedCertificate: Certificate
  ) => {
  
  
    try {
      // Create an array of payloads for each field that needs to be updated
      const payloads: InputGenerateTransactionPayloadData[] = [];
  
      updatedCertificate = {
          ...updatedCertificate,
          status: "in_progress"
      }
  
      // Iterate over the properties of the updatedCertificate to identify changes
      for (const key in updatedCertificate) {
        if (
          updatedCertificate[key as keyof Certificate] !==
          originalCertificate[key as keyof Certificate]
        ) {
          // Create a payload for each modified field
          const payload: InputGenerateTransactionPayloadData = {
            function:
              `${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::update_property`,
            typeArguments: [
              `${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::GOToken`,
            ],
            functionArguments: [
              updatedCertificate.tokenOnChainId,
              key,
              "vector<u8>",
              MoveVector.U8(
                new HexString(stringToHex(updatedCertificate[key as keyof Certificate] as string)).hex()
              ),
            ],
          };
          payloads.push(payload);
        }
      }
  
      if (payloads.length > 0) {
        await aptos.transaction.batch.forSingleAccount({
          sender: accountAdmin,
          data: payloads,
        });
  
        aptos.transaction.batch.on(TransactionWorkerEventsEnum.ExecutionFinish, async (data) => {
          console.log(data);
  
          const account = await aptos.getAccountInfo({
            accountAddress: accountAdmin.accountAddress,
          });
          console.log(`Account sequence number is updated: ${account.sequence_number}`);
  
          aptos.transaction.batch.removeAllListeners();
        });
  
        if(originalCertificate.transferredToDemander){
        const response = await signAndSubmitTransaction({
          sender: walletAccount?.address,
          data: {
              function: "0x1::object::transfer",
              typeArguments:[`${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::GOToken`],
              functionArguments: [
                  originalCertificate.tokenOnChainId,
                  import.meta.env.VITE_ACCOUNT_ADDRESS!
              ],
          },
        });
        // if you want to wait for transaction
        try {
          await aptos.waitForTransaction({ transactionHash: response });
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log("No changes detected for on-chain update.");
      }}
    } catch (error) {
      console.error("Error updating certificate on-chain:", error);
    }
  };
  

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3000/demand/certificateWithId/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
            
          throw new Error('Failed to fetch certificate');
          
        }


        const data = await response.json();
        console.log(data)
        setCertificate(data);
        setUpdatedCertificate(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id, certificate?.status]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (updatedCertificate) {
      setUpdatedCertificate((prev) => {
        if (name === "FechaInicio" || name === "FechaFin") {
          return {
            ...prev!,
            [name]: new Date(value), // Convert the date string to a Date object
          };
        } else {
          return {
            ...prev!,
            [name]: value,
          };
        }
      });
    }
  };

  const handleUpdateCertificate = async () => {
    try {
      if (certificate != null && updatedCertificate != null) {
        const formattedCertificate = {
          ...updatedCertificate,
          FechaInicio: new Date(updatedCertificate.FechaInicio).toISOString(),
          FechaFin: new Date(updatedCertificate.FechaFin).toISOString(),
          status: "in_progress"
        };

        await updateCertificateOnChain(certificate, formattedCertificate);

        const response = await fetch(`http://localhost:3000/demand/certificate/update/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedCertificate),
        });

        if (!response.ok) {
          throw new Error('Failed to update certificate');
        }

        const updatedData = await response.json();
        //setCertificate(updatedData);
        setUpdatedCertificate(updatedData);

        handleDialogClose();

        // Redirect to in-progress page after successful update
        navigate(`/demander/in_progress/${razonSocial}/certificate/${id}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && certificate ? (
        <Card
          variant="outlined"
          sx={{
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            p: 3,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BusinessCenterIcon sx={{ color: '#2e7d32' }} />
              {certificate.RazonSocial} - GO's ID: {certificate.id}
            </Typography>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f1f8e9', mb: 2 }}
                >
                  <VerifiedIcon sx={{ color: '#2e7d32', mr: 2 }} />
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      <strong>CIF:</strong>
                    </Typography>
                    <Typography variant="body2">{certificate.CIF}</Typography>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f1f8e9', mb: 2 }}
                >
                  <CalendarTodayIcon sx={{ color: '#2e7d32', mr: 2 }} />
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      <strong>Fecha Inicio:</strong>
                    </Typography>
                    <Typography variant="body2">{new Date(certificate.FechaInicio).toLocaleDateString()}</Typography>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f1f8e9', mb: 2, minHeight: '54px' }}
                >
                  <CalendarTodayIcon sx={{ color: '#2e7d32', mr: 2 }} />
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      <strong>Fecha Fin:</strong>
                    </Typography>
                    <Typography variant="body2">{new Date(certificate.FechaFin).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f1f8e9', mb: 2 }}
                >
                  <BoltIcon sx={{ color: '#2e7d32', mr: 2 }} />
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      <strong>Potencia:</strong>
                    </Typography>
                    <Typography variant="body2">{certificate.Potencia} kW</Typography>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f1f8e9', mb: 2 }}
                >
                  <BoltIcon sx={{ color: '#2e7d32', mr: 2 }} />
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      <strong>Tecnologia:</strong>
                    </Typography>
                    <Typography variant="body2">{certificate.Tecnologia}</Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f1f8e9', mb: 2 }}>
                  <Box display="flex" alignItems="center">
                    <ChainIcon sx={{ color: '#2e7d32', mr: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      <strong>On-Chain Address:</strong>
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ ml: 5 }}>
                    <Typography variant="body2">{truncateAddress(certificate.tokenOnChainId)}</Typography>
                    <Tooltip title="Copy Address">
                      <IconButton
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => copyToClipboard(certificate.tokenOnChainId)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid2>
            </Grid2>

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                Status: {certificate.status}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleDialogOpen}
                sx={{
                  textTransform: 'none',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  color: '#2e7d32',
                  borderColor: '#2e7d32',
                  '&:hover': {
                    backgroundColor: '#e8f5e9',
                    borderColor: '#1b5e20',
                  },
                }}
              >
                Edit Certificate
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        !loading && !error && <Alert severity="info">No certificate found.</Alert>
      )}

      {/* Dialog for Editing Certificate */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit Certificate</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              name="CIF"
              label="CIF"
              value={updatedCertificate?.CIF || ''}
              fullWidth
              onChange={handleInputChange}
              margin="dense"
            />
            <TextField
              name="Potencia"
              label="Potencia"
              value={updatedCertificate?.Potencia || ''}
              fullWidth
              onChange={handleInputChange}
              margin="dense"
            />
            <TextField
              name="Tecnologia"
              label="Tecnologia"
              value={updatedCertificate?.Tecnologia || ''}
              fullWidth
              onChange={handleInputChange}
              margin="dense"
            />
            <TextField
              name="FechaInicio"
              label="Fecha Inicio"
              type="date"
              value={
                updatedCertificate?.FechaInicio
                  ? new Date(updatedCertificate.FechaInicio).toISOString().split("T")[0] // Format Date to YYYY-MM-DD
                  : ""
              }
              fullWidth
              onChange={handleInputChange}
              margin="dense"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              name="FechaFin"
              label="Fecha Fin"
              type="date"
              value={
                updatedCertificate?.FechaFin
                  ? new Date(updatedCertificate.FechaFin).toISOString().split("T")[0] // Format Date to YYYY-MM-DD
                  : ""
              }
              fullWidth
              onChange={handleInputChange}
              margin="dense"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} startIcon={<CancelIcon />} color="secondary">
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            color="primary"
            onClick={handleUpdateCertificate}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DemanderCertificateDetails;
