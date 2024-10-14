import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Typography, CircularProgress, Container, Alert, Box, Grid2, Tooltip, IconButton, Button, Dialog, Divider, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedIcon from '@mui/icons-material/Verified';
import ChainIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import UpdateIcon from '@mui/icons-material/Update';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey, AccountAddress, MoveVector } from "@aptos-labs/ts-sdk";
import { HexString } from "aptos";

const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

const privateKey = new Ed25519PrivateKey(import.meta.env.VITE_PRIVATE_KEY!);
const address = AccountAddress.from(import.meta.env.VITE_ACCOUNT_ADDRESS!);
const accountAdmin = Account.fromPrivateKey({ privateKey, address });

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
  GarantiaSolicitada: number;
  demanderEmail: string;
}

const truncateAddress = (address: string, startLength = 6, endLength = 6) => {
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('On-Chain Address copied to clipboard');
  });
};

function stringToHex(str: string): string {
  return str
    .split('')
    .map((char) => char.charCodeAt(0).toString(16))
    .join("");
}

const IssuerCertificateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('in_progress');
  const [openDialog, setOpenDialog] = useState(false);
  const [verificationResponse, setVerificationResponse] = useState<any>(null);
  const token = localStorage.getItem('authToken');

  const updateStatus = async (tokenAddress: string, tokenStatus: string): Promise<string> => {
    const transaction = await aptos.transaction.build.simple({
      sender: accountAdmin.accountAddress,
      data: {
        function: `${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::update_property`,
        typeArguments: [`${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::GOToken`],
        functionArguments: [
          tokenAddress,
          "status",
          "vector<u8>",
          new HexString(stringToHex(tokenStatus)).hex()
        ],
      },
    });

    const senderAuthenticator = aptos.transaction.sign({
      signer: accountAdmin,
      transaction,
    });

    const pendingTxn = await aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });

    return pendingTxn.hash;
  };


  const fetchUser = async (email:string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/auth/getUserWithEmail/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      return data[0];
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCertificate = async (certificate: Certificate) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const certificateToVerify = {
        ...certificate,
        GarantiaSolicitada: parseFloat(certificate.GarantiaSolicitada.toString()),
      };
  
      const verificationResponse = await fetch('http://localhost:3000/demand/verifyCertificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateToVerify),
      });
  
      if (!verificationResponse.ok) {
        throw new Error(`Verification failed for certificate with ID: ${certificate.id}`);
      }
  
      const verificationResult = await verificationResponse.json();
      setVerificationResponse(verificationResult);
      setOpenDialog(true); 
  
      // Handle successful verification
      setSuccess(`Certificate with ID ${certificate.id} successfully verified.`);
    } catch (error: any) {
      console.error(`Error verifying certificate with ID ${certificate.id}:`, error);
      setError(error.message || `Failed to verify certificate with ID ${certificate.id}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateSingleCertificate = async (certificate: Certificate) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Fetch user details based on the demanderEmail
      const user = await fetchUser(certificate.demanderEmail);
      
      // Ensure the certificate has a valid tokenOnChainId
      const tokenAddress = certificate.tokenOnChainId;
      if (!tokenAddress) {
        console.warn(`Skipping certificate with missing tokenOnChainId: ${certificate.id}`);
        setError(`Certificate with ID: ${certificate.id} does not have a valid tokenOnChainId`);
        setLoading(false);
        return;
      }
  
      // Step 1: Convert GarantiaSolicitada to a float for verification
      const certificateToVerify = {
        ...certificate,
        GarantiaSolicitada: parseFloat(certificate.GarantiaSolicitada.toString()),
      };
  
      // Step 2: Verify the certificate by calling the backend verification endpoint
      const verificationResponse = await fetch('http://localhost:3000/demand/verifyCertificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateToVerify),
      });
  
      if (!verificationResponse.ok) {
        console.warn(`Verification failed for certificate ${certificate.id}`);
        setError(`Verification failed for certificate with ID: ${certificate.id}`);
        setLoading(false);
        return;
      }
  
      const verificationResult = await verificationResponse.json();
      console.log(`Verification result for ${certificate.id}:`, verificationResult);
  
      // Step 3: If verification is successful, update status on-chain to "issued"
      const txnHash = await updateStatus(tokenAddress, "issued");
      console.log(`Transaction for ${certificate.id} completed with hash: ${txnHash}`);
  
      // Step 4: Update status in the backend database
      const updateResponse = await fetch(
        `http://localhost:3000/demand/updateCertificateStatus/${certificate.RazonSocial}/${certificate.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'issued',
          }),
        }
      );
  
      if (!updateResponse.ok) {
        throw new Error(`Failed to update status in the database for certificate ${certificate.id}`);
      }
  
      const updateResult = await updateResponse.json();
      console.log(`Database status for ${certificate.id} updated:`, updateResult);
  
      // Step 5: Transfer the certificate on-chain to the recipient
      const recipientAccount = new AccountAddress(new HexString(user?.walletAddress ?? "").toUint8Array());
  
      const transferTransaction = await aptos.transferDigitalAssetTransaction({
        sender: accountAdmin,
        digitalAssetAddress: certificate.tokenOnChainId,
        recipient: recipientAccount,
      });
  
      const committedTxn = await aptos.signAndSubmitTransaction({ signer: accountAdmin, transaction: transferTransaction });
      const pendingTxn = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
      console.log("Transfer successful, txn:", pendingTxn);
  
      // Step 6: Update the transferred status in the backend database
      const updateTransfer = await fetch(
        `http://localhost:3000/demand/updateCertificateToTransferred/${certificate.RazonSocial}/${certificate.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!updateTransfer.ok) {
        throw new Error(`Failed to update transferred status in the database for certificate ${certificate.id}`);
      }
  
      const updateTransferResult = await updateTransfer.json();
      console.log(`Database transferred status for ${certificate.id} updated:`, updateTransferResult);
  
      // Step 7: Set success message
      setSuccess(`Certificate with ID ${certificate.id} successfully updated to 'issued' on-chain and in the database.`);
    } catch (error: any) {
      console.error("Error updating certificate:", error);
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
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
        setCertificate(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  const handleIssueCertificate = () => {
    if (certificate) {
        handleUpdateSingleCertificate(certificate);
    }
};


const handleCloseDialog = () => {
  setOpenDialog(false);
};
return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
        {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
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
                            <Tooltip title={certificate.CIF}>
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '200px', // Adjust width as per your design needs
                                }}
                              >
                                {certificate.CIF}
                              </Typography>
                            </Tooltip>
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
                                    <Typography variant="body2">
                                        {new Date(certificate.FechaInicio).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box
                                display="flex"
                                alignItems="center"
                                sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f1f8e9', mb: 2, minHeight: "54px" }}
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
                          <VerifiedIcon sx={{ color: '#2e7d32', mr: 2 }} />
                          <Box>
                            <Typography variant="body1" color="textSecondary">
                              <strong>Potencia:</strong>
                            </Typography>
                            <Tooltip title={certificate.CIF}>
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '200px', // Adjust width as per your design needs
                                }}
                              >
                                {certificate.Potencia}
                              </Typography>
                            </Tooltip>
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
                    </Box>

                    {/* Issue Certificate Button */}
                    <Box mt={4} display="flex" justifyContent="center">
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleIssueCertificate}
                            startIcon={<CheckCircleIcon />}
                            sx={{
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 20px rgba(0, 128, 0, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 25px rgba(0, 128, 0, 0.4)',
                                },
                            }}
                        >
                            Issue Certificate
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleVerifyCertificate(certificate)} // This will call the verify function
                          startIcon={<VerifiedIcon />}
                          sx={{
                              borderRadius: '20px',
                              marginLeft: '10px',
                              padding: '8px 16px',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 20px rgba(0, 128, 0, 0.3)',
                              '&:hover': {
                                  boxShadow: '0 6px 25px rgba(0, 128, 0, 0.4)',
                              },
                          }}
                      >
                          Verify Certificate
                      </Button>
                    </Box>
                </CardContent>
            </Card>
        ) : (
            !loading && !error && <Alert severity="info">No certificate found.</Alert>
        )}



<Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        p: 2,
                        boxShadow: '0 8px 30px rgba(0, 128, 0, 0.4)', // Modern shadow effect
                        animation: 'fadeIn 0.3s ease-in-out', // Add smooth animation
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', color: '#2e7d32' }}>
                    Verification Result
                </DialogTitle>
                <DialogContent dividers>
                    {verificationResponse && (
                        <>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#424242' }}>
                                {verificationResponse.message}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                                Public Signals:
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                {verificationResponse.publicSignalsFinal[0] === "1" ? "Certificate is Valid" : "Certificate is Invalid"}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                                Verification Key:
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', mb: 2 }}>
                                {verificationResponse.verificationKey}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                                Proof Details:
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', mb: 2 }}>
                                {JSON.stringify(verificationResponse.proofFinal, null, 2)}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDialog}
                        variant="contained"
                        sx={{
                            borderRadius: '20px',
                            padding: '8px 16px',
                            fontWeight: 'bold',
                            backgroundColor: '#2e7d32',
                            '&:hover': {
                                backgroundColor: '#1b5e20',
                            },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
    </Container>
);
};

export default IssuerCertificateDetails;
