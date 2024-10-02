import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Typography, CircularProgress, Container, Alert, Box, Grid2, Tooltip, IconButton,   Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedIcon from '@mui/icons-material/Verified';
import ChainIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import UpdateIcon from '@mui/icons-material/Update';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey, AccountAddress, Bool, U64, MoveVector, MoveString, U8, Hex, AccountAuthenticator, KeylessAccount } from "@aptos-labs/ts-sdk";
import { HexString } from "aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

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


const CertificateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('issued');

 
  //function to update status on-chain
  const updateStatus = async (tokenAddress: string, tokenStatus: string): Promise<string> => {
    const transaction = await aptos.transaction.build.simple({
      sender: accountAdmin.accountAddress,
      data: {
        function: "0x6e91c7b2de00d2bd7224d113dfd67e3fe7f84a8cc0bdef547e15dc338a871621::guarantee_of_origin::update_property",
        typeArguments:["0x6e91c7b2de00d2bd7224d113dfd67e3fe7f84a8cc0bdef547e15dc338a871621::guarantee_of_origin::GOToken"],
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

// Function to update status off-chain for a specific certificate with a specific status
const handleUpdateCertificate = async (certificate: Certificate, newStatus: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      // Ensure that the certificate has a tokenOnChainId
      const tokenAddress = certificate.tokenOnChainId;
  
      if (!tokenAddress) {
        console.warn(`Skipping certificate with missing tokenOnChainId: ${certificate.id}`);
        setError(`Certificate with ID: ${certificate.id} does not have a valid tokenOnChainId`);
        setLoading(false);
        return;
      }
  
      // Step 1: Update status on-chain
      const txnHash = await updateStatus(tokenAddress, newStatus);
      console.log(`Transaction for ${certificate.id} completed with hash: ${txnHash}`);
  
      // Step 2: Update status in the backend database
      const updateResponse = await fetch(
        `http://localhost:3000/demand/updateCertificateStatus/${certificate.RazonSocial}/${certificate.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );
  
      if (!updateResponse.ok) {
        throw new Error(`Failed to update status in database for certificate ${certificate.id}`);
      }
  
      const updateResult = await updateResponse.json();
      console.log(`Database status for ${certificate.id} updated:`, updateResult);
  
      // Step 3: Set success message
      setSuccess(`Certificate with ID ${certificate.id} successfully updated to '${newStatus}' on-chain and in the database.`);
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
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch certificate');
        }

        const data = await response.json();
        setCertificate(data[0]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogConfirm = () => {
    if (certificate) {
      handleUpdateCertificate(certificate, selectedStatus);
    }
    setDialogOpen(false);
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
              <Grid2 size={{xs: 12, md: 6}}>
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
                    <Typography variant="body2">
                      {new Date(certificate.FechaInicio).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f1f8e9', mb: 2, minHeight:"54px" }}
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

              <Grid2 size={{xs: 12, md: 6}}>
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

                <Box
                  sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f1f8e9', mb: 2 }}
                >
                                    <Box display= "flex" alignItems="center">
                                      <ChainIcon sx={{ color: '#2e7d32', mr: 2}} />
                  <Typography variant="body1" color="textSecondary">
                    <strong>On-Chain Address:</strong>
                  </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ml:5}}>  
                    <Typography variant="body2">{truncateAddress(certificate.tokenOnChainId)}</Typography>
                    <Tooltip title="Copy Address">
                      <IconButton
                        size="small"
                        sx={{ ml:  1}}
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
            {/* Update Status Button */}
            <Box mt={4} display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="success"
                onClick={handleDialogOpen}
                startIcon={<UpdateIcon />}
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
                Update Status
              </Button>
            </Box>

{/* Dialog for updating status */}
<Dialog
  open={dialogOpen}
  onClose={handleDialogClose}
  PaperProps={{
    sx: {
      borderRadius: '16px',
      p: 2,
      width: '400px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    },
  }}
>
  <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', color: '#2e7d32' }}>
    Update Certificate Status
  </DialogTitle>
  <DialogContent>
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2 }}>
      <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          label="Status"
          sx={{
            borderRadius: '12px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#2e7d32',
              },
              '&:hover fieldset': {
                borderColor: '#66bb6a',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2e7d32',
              },
            },
          }}
        >
          <MenuItem value="audited" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            <CheckCircleIcon sx={{ color: '#2e7d32', mr: 1 }} /> Audited
          </MenuItem>
          <MenuItem value="rejected" sx={{ fontWeight: 'bold', color: '#f44336' }}>
            <CancelIcon sx={{ color: '#f44336', mr: 1 }} /> Rejected
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  </DialogContent>
  <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
    <Button
      onClick={handleDialogClose}
      startIcon={<CancelIcon />}
      sx={{
        borderRadius: '20px',
        px: 3,
        fontWeight: 'bold',
        color: '#f44336',
        textTransform: 'none',
        transition: 'background-color 0.3s',
        '&:hover': {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
        },
      }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      onClick={handleDialogConfirm}
      startIcon={<CheckCircleIcon />}
      color="success"
      sx={{
        borderRadius: '20px',
        px: 3,
        fontWeight: 'bold',
        boxShadow: '0 4px 20px rgba(0, 128, 0, 0.3)',
        textTransform: 'none',
        '&:hover': {
          boxShadow: '0 6px 25px rgba(0, 128, 0, 0.4)',
        },
      }}
    >
      Confirm
    </Button>
  </DialogActions>
</Dialog>
          </CardContent>
        </Card>
      ) : (
        !loading && !error && <Alert severity="info">No certificate found.</Alert>
      )}
    </Container>
  );
};

export default CertificateDetails;
