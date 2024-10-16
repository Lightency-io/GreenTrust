import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey, AccountAddress, Bool, U64, MoveVector, MoveString, U8, Hex, AccountAuthenticator, KeylessAccount, LedgerVersionArg, MoveOption, AccountAddressInput } from "@aptos-labs/ts-sdk";
import React, { useEffect, useState } from 'react';
import { HexString } from "aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getAddressFromAccountOrAddress } from "aptos";
import { Button, CircularProgress } from '@mui/material'; 

const SAFETY_FACTOR = 1.5

interface Certificate {
  id: number;
  CIF: string;
  RazonSocial: string;
  FechaInicio: string;
  FechaFin: string;
  Tecnologia: string;
  Potencia: string;
  status: string;
  demanderEmail: string;
}
interface User {
  id: string;
  email: string;
  role: string;
  walletAddress: string;
}

const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

const privateKey = new Ed25519PrivateKey(import.meta.env.VITE_PRIVATE_KEY!);
const address = AccountAddress.from(import.meta.env.VITE_ACCOUNT_ADDRESS!);
const accountAdmin = Account.fromPrivateKey({ privateKey, address });

const privateKey2 = new Ed25519PrivateKey("0x854ebaf707015333ee729aa53b0ecfd48eb2f66c744df0607ab7fedea269091b");
const address2 = AccountAddress.from("0xb2344bad2ba8f6d5c0726e3ffebe74a481f7eafdb84b3eea22804295906ac992");
const accountAdmin2 = Account.fromPrivateKey({ privateKey: privateKey2, address: address2 });

function stringToHex(str: string): string {
    return str
      .split('')
      .map((char) => char.charCodeAt(0).toString(16))
      .join("");
  }

const CNMSPage = () => {
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
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [tokenStatus, setTokenStatus] = useState<string>("in_progress");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [digitalAssetAddress, setDigitalAssetAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [response, setResponse] = useState(null);
  const [ledgerVersion, setLedgerVersion] = useState<LedgerVersionArg>()
  //const [user, setUser] = useState<User>()

  // Fetch Certificates from API
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch("http://localhost:3000/demand/getDemand");
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const result = await response.json();
        setCertificates(result);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    };
    fetchCertificates();
  }, []);

  // Function to create collection
  const createCollection = async (certificate: Certificate): Promise<string> => {
    const transaction = await aptos.transaction.build.simple({
      sender: accountAdmin.accountAddress,
      data: {
        function: `${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::create_collection`,
        functionArguments: [
          "This is a collection for the Guarantee of Origin Certificates on GreenTrust",
          "GreenTrust Guarantee of Origins Specific to "+certificate.RazonSocial,
          "https://greentrust/gos",
          true, // mutableDescription
          true, // mutableRoyalty
          true, // mutableURI
          true, // mutableTokenDescription
          true, // mutableTokenName
          true, // mutableTokenProperties
          true, // mutableTokenURI
          true, // tokensBurnableByCreator
          true, // tokensFreezableByCreator
          new U64(0), // royaltyNumerator
          new U64(100), // royaltyDenumerator
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

  // Function to mint token based on certificate data
  const mintToken = async (certificate: Certificate): Promise<string> => {
    //console.log(certificate)

    
    const CIFHex = new HexString(stringToHex(certificate.CIF));
    const razonSocialHex = new HexString(stringToHex(certificate.RazonSocial));
    const fechaInicioHex = new HexString(stringToHex(certificate.FechaInicio));
    const fechaFinHex = new HexString(stringToHex(certificate.FechaFin));
    const tecnologiaHex = new HexString(stringToHex(certificate.Tecnologia));
    const potenciaHex = new HexString(stringToHex(certificate.Potencia.toString()));
    const statusHex = new HexString(stringToHex(certificate.status));

    const transaction = await aptos.transaction.build.simple({
      sender: accountAdmin.accountAddress,
      data: {
        function: `${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::mint`,
        functionArguments: [
          "GreenTrust Guarantee of Origins Specific to "+certificate.RazonSocial, // Collection name must match what was created earlier
          "This is a Guarantee of Origin Certificate offered to "+certificate.RazonSocial+' for the amount of '+certificate.Potencia, // Description for the token (can be certificate's RazonSocial)
          certificate.RazonSocial+"'s GO - ID: "+certificate.id.toString(), // Token name (use certificate id)
          "https://greentrust/goAsset", // Static URI for the token
          MoveVector.MoveString(["CIF", "RazonSocial", "FechaInicio", "FechaFin", "Tecnologia", "Potencia", "status"]), // Properties
          MoveVector.MoveString(["vector<u8>", "vector<u8>", "vector<u8>", "vector<u8>", "vector<u8>", "vector<u8>", "vector<u8>"]), // Property types
          new MoveVector<MoveVector<U8>>([
            MoveVector.U8(CIFHex.hex()),
            MoveVector.U8(razonSocialHex.hex()),
            MoveVector.U8(fechaInicioHex.hex()),
            MoveVector.U8(fechaFinHex.hex()),
            MoveVector.U8(tecnologiaHex.hex()),
            MoveVector.U8(potenciaHex.hex()),
            MoveVector.U8(statusHex.hex()),
          ]), // Property values
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

  // Create collections and mint tokens based on certificates
  const createCollectionsAndMintTokens = async () => {
    for (const certificate of certificates) {
      try {
      // Fetch existing collections
      const collections = await aptos.getAccountCollectionsWithOwnedTokens({
        accountAddress: accountAdmin.accountAddress,
      });


      // Check if collection already exists by name
      const collectionExists = collections.some(
        (collection: any) => collection.collection_name === "GreenTrust Guarantee of Origins Specific to "+certificate.RazonSocial
      );
      console.log("collection exists", collectionExists);

      if (collectionExists) {
        console.log("Collection already exists:", "GreenTrust Guarantee of Origins Specific to "+certificate.RazonSocial);
      } else {
        // Create a new collection if it doesn't exist
        const collectionHash = await createCollection(certificate);
        console.log("Collection created:", collectionHash);
      }

        const tokens = await aptos.getAccountOwnedTokens({accountAddress:accountAdmin.accountAddress});
        console.log("tokens", tokens)
        const tokenExists = tokens.some(
            (token: any) => token.current_token_data.token_name === certificate.RazonSocial+"'s GO - ID: "+certificate.id.toString()
          );
        console.log("token exists", tokenExists);

        if(tokenExists){
            console.log("Certificate already minted: ", certificate.RazonSocial+"'s GO - ID: "+certificate.id.toString())
        }
        else{
        const mintHash = await mintToken(certificate);
        console.log("Token minted:", mintHash);
        setTransactionHash(mintHash);
        }
      } catch (error) {
        console.error("Error creating collection or minting token:", error);
      }
    }
  };


  const updateStatus = async (tokenAddress: string, tokenStatus: string): Promise<string> => {
    const transaction = await aptos.transaction.build.simple({
      sender: accountAdmin.accountAddress,
      data: {
        function: `${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::update_property`,
        typeArguments:[`${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::GOToken`],
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


  const burnToken = async (tokenAddress: string): Promise<string> => {
    const transaction = await aptos.transaction.build.simple({
      sender: accountAdmin.accountAddress,
      data: {
        function: `${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::burn`,
        typeArguments:[`${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::GOToken`],
        functionArguments: [
            tokenAddress
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


  
  const handleUpdateCertificates = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Step 1: Fetch certificates in progress from the backend
      const response = await fetch('http://localhost:3000/demand/certificatesInProgress');
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }
  
      const certificatesInProgress = await response.json();
      // const certificatesInProgress = data.certificates;
  
      if (!certificatesInProgress.length) {
        setError("No certificates found with status 'in_progress'");
        setLoading(false);
        return;
      }
  
      // Step 2: Iterate over each certificate and update status on-chain and backend
      for (const certificate of certificatesInProgress) {


        const user = await fetchUser(certificate.demanderEmail)
        //console.log("hiiii",user)
        const tokenAddress = certificate.tokenOnChainId;
  
        if (!tokenAddress) {
          console.warn(`Skipping certificate with missing tokenOnChainId: ${certificate.id}`);
          continue; // Skip to the next certificate if tokenOnChainId is missing
        }
        
      // Step 2.1: Convert GarantiaSolicitada to a float
      const certificateToVerify = {
        ...certificate,
        GarantiaSolicitada: parseFloat(certificate.GarantiaSolicitada)
      };

      // Step 2.2: Verify the certificate
      const verificationResponse = await fetch('http://localhost:3000/demand/verifyCertificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateToVerify),
      });

      if (!verificationResponse.ok) {
        console.warn(`Skipping certificate as verification failed for ${certificate.id}`);
        continue; // Skip to the next certificate if verification fails
      }

      const verificationResult = await verificationResponse.json();
      console.log(`Verification result for ${certificate.id}:`, verificationResult);



        // Update status on-chain to "issued"
        const txnHash = await updateStatus(tokenAddress, "issued");
        console.log(`Transaction for ${certificate.id} completed with hash: ${txnHash}`);
  
        // Step 3: Update status in the backend database
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
          throw new Error(`Failed to update status in database for certificate ${certificate.id}`);
        }
  
        const updateResult = await updateResponse.json();
        console.log(`Database status for ${certificate.id} updated:`, updateResult);



        const recipientAccount = new AccountAddress(new HexString(user?.walletAddress ?? "").toUint8Array())
  
        const transferTransaction = await aptos.transferDigitalAssetTransaction({
          sender: accountAdmin,
          digitalAssetAddress: certificate.tokenOnChainId,
          recipient: recipientAccount,
        }); 
  
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: accountAdmin, transaction: transferTransaction });
        const pendingTxn = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        console.log("transfer success, txn:", pendingTxn)
  
  
  
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
          throw new Error(`Failed to update transferred in database for certificate ${certificate.id}`);
        }
    
        const updateTransferResult = await updateTransfer.json();
        console.log(`Database transferred status for ${certificate.id} updated:`, updateTransferResult);
      }
      



      // Step 4: Set success message once all updates are done
      setSuccess("All certificates successfully updated to 'issued' on chain and in the database.");
  
    } catch (error: any) {
      console.error("Error updating certificates:", error);
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  

  // const handleTransferFee = async () => {
  //   setLoading(true);

  //   try {
  //     const transaction = await aptos.transaction.build.simple({
  //       sender: accountAdmin.accountAddress,
  //       withFeePayer: true,
  //       data: {
  //         function: "0x1::aptos_account::transfer",
  //         functionArguments: [
  //           new AccountAddress(
  //             new HexString("0xafcc1026cbcd1472c3dcfe5f12dffe8e33d2f118535b637e728e8a4850929ca6").toUint8Array()
  //           ), 
  //           1
  //         ],
  //       },
  //     });

  //     const senderAuth = aptos.transaction.sign({ signer: accountAdmin, transaction });
  //     const feePayerAuthenticator = await signTransaction(transaction, true);

  //     const txnResponse = await aptos.transaction.submit.simple({
  //       transaction: transaction,
  //       senderAuthenticator: senderAuth,
  //       feePayerAuthenticator:feePayerAuthenticator,
  //     });

  //     const executedTransaction = await aptos.waitForTransaction({ transactionHash: txnResponse.hash });
  //     console.log("executed transaction", executedTransaction.hash);
  //   } catch (error) {
  //     console.error("Transaction failed:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleTransferFee = async () => {
    setLoading(true);

    try {
      const transaction = await aptos.transaction.build.simple({
        sender: accountAdmin.accountAddress,
        data: {
          function: "0x1::aptos_account::transfer",
          functionArguments: [
            new AccountAddress(
              new HexString("0xafcc1026cbcd1472c3dcfe5f12dffe8e33d2f118535b637e728e8a4850929ca6").toUint8Array()
            ), 
            100000000
          ],
        },
      });


      const [userTransactionResponse] = await aptos.transaction.simulate.simple({
        signerPublicKey: accountAdmin.publicKey,
        transaction,
        options: {estimateGasUnitPrice:true, estimateMaxGasAmount:true}
    });



    let maxGasAmount = Number(userTransactionResponse.max_gas_amount);
    let gasUsed = Number(userTransactionResponse.gas_used);
    let gasUnitPrice = Number(userTransactionResponse.gas_unit_price);

    let gasUsedWithSafety = gasUsed * SAFETY_FACTOR;

    maxGasAmount = Math.min(maxGasAmount, gasUsedWithSafety);

    let gasToPay = maxGasAmount * gasUnitPrice;
    
    console.log(walletAccount?.address)
    const payTransaction = await signAndSubmitTransaction({
      sender: walletAccount?.address,
      data: {
        function: "0x1::aptos_account::transfer",
        functionArguments: [
          import.meta.env.VITE_ACCOUNT_ADDRESS, 
          gasToPay
        ],
      },
    });


    aptos.waitForTransaction({ transactionHash: payTransaction.hash }).then(async (res)=>{
      console.log(res.success)

      const senderAuth = aptos.transaction.sign({ signer: accountAdmin, transaction });

      const txnResponse = await aptos.transaction.submit.simple({
        transaction: transaction,
        senderAuthenticator: senderAuth,
      });

      const executedTransaction = await aptos.waitForTransaction({ transactionHash: txnResponse.hash });
      console.log("executed transaction", executedTransaction.hash, executedTransaction.success);
    }) .catch(async(err)=>{
      if (walletAccount?.address){
        const rollbackTransaction = await aptos.transaction.build.simple({
          sender: accountAdmin.accountAddress,
          data: {
            function: "0x1::aptos_account::transfer",
            functionArguments: [
              new AccountAddress(
                new HexString(walletAccount?.address).toUint8Array()
              ), 
              gasToPay
            ],
          },
        });

        const senderAuthRoll = aptos.transaction.sign({ signer: accountAdmin, transaction: rollbackTransaction });

        const txnResponseRoll = await aptos.transaction.submit.simple({
          transaction: rollbackTransaction,
          senderAuthenticator: senderAuthRoll,
        });


        const executedTransactionRoll = await aptos.waitForTransaction({ transactionHash: txnResponseRoll.hash });
        console.log("executed transaction", executedTransactionRoll.hash, executedTransactionRoll.success)
      }
    })
  

    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleBalance = async () => {
    setLoading(true);

    try {

      const COIN_STORE = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";
      type Coin = { coin: { value: string } };
      const resource: any = await aptos.getAccountResource<Coin>({
        accountAddress: "0xafcc1026cbcd1472c3dcfe5f12dffe8e33d2f118535b637e728e8a4850929ca6",
        resourceType: COIN_STORE,
        options: ledgerVersion,
      });
      const amount = Number(resource.coin.value);

      aptos.getGasPriceEstimation()
      console.log(amount)
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setLoading(false);
    }
  };



  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const hash = await updateStatus(tokenAddress, tokenStatus);
      console.log("Transaction hash:", hash);
      setTransactionHash(hash);
    } catch (error) {
      console.error("Error updating token status:", error);
    }
  };



// Function to handle the digital asset transfer
const transferDigitalAsset = async (digitalAssetAddress: string, recipient: string) => {
  const recipientAccount = new AccountAddress(new HexString(recipient).toUint8Array())


  const response = await signAndSubmitTransaction({
    sender: walletAccount?.address,
    data: {
        function: "0x1::object::transfer",
        typeArguments:[`${import.meta.env.VITE_CONTRACT_ADDRESS!}::guarantee_of_origin::GOToken`],
        functionArguments: [
            digitalAssetAddress,
            recipient
        ],
    },
  });
  // if you want to wait for transaction
  try {
    await aptos.waitForTransaction({ transactionHash: response });
  } catch (error) {
    console.error(error);
  }
};


// // Function to handle the digital asset transfer
// const mintConnectify = async () => {
//   const statusHex = new HexString(stringToHex("hiiii"));
//   console.log("hi",walletAccount?.address)
//   const transaction = await aptos.transaction.build.simple({
//     sender: accountAdmin2.accountAddress,
//     data: {
//         function: "0x6d4e728b5c3b532920dae71dca6c00ec7d6e0be6d4aab9e59d89f0cf8078d9d2::ConnectifyContract::mint_as_manufacturer",
//         functionArguments: [
//             "Amazon",
//             "CEO Entrepreneur born in 1964 Jeffrey Bezos",
//             "Amazon Kindle 0x1",
//             "www.connectify.io",
//             true,
//             "@0x5d7c369f8891eff9c6134fad500acb9e2b65888df6f1a5f58b5bd247ccd5fd93",
//             MoveVector.MoveString(["alou"]), // Properties
//             MoveVector.MoveString(["vector<u8>"]), // Property types
//             new MoveVector<MoveVector<U8>>([MoveVector.U8(statusHex.hex())]),
            
//         ],
//     },
//   });

//   const senderAuthenticator = aptos.transaction.sign({
//     signer: accountAdmin2,
//     transaction,
//   });

//   const pendingTxn = await aptos.transaction.submit.simple({
//     transaction,
//     senderAuthenticator,
//   });
//   // if you want to wait for transaction
//   try {
//     await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
//   } catch (error) {
//     console.error(error);
//   }
// };

// const handleMintConnectify = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setError(null);
//   setSuccess(null);

//   try {
//     // Call the transfer function with the input values
//     const transactionResult = await mintConnectify();
//     setSuccess('Digital asset transferred successfully.');
//   } catch (err) {
//     setError('Error: ' + err.message);
//   } finally {
//     setLoading(false);
//   }
// };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call the transfer function with the input values
      const transactionResult = await transferDigitalAsset(digitalAssetAddress, recipient);
      setSuccess('Digital asset transferred successfully.');
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


    // Function to handle form submission
    const handleBurnSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);
  
      try {
        // Call the transfer function with the input values
        const transactionResult = await burnToken(digitalAssetAddress);
        setSuccess('Digital asset transferred successfully.');
      } catch (err) {
        setError('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <h1>Create Collections and Mint Tokens from Certificates</h1>
      <button onClick={createCollectionsAndMintTokens}>Start Process</button>
      {transactionHash && <p>Last Transaction Hash: {transactionHash}</p>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleTransferFee}
        disabled={loading}
      >
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleBalance}
        disabled={loading}
      >balance
      </Button>

      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleMintConnectify}
        disabled={loading}
      >Mint
      </Button> */}
      <h1>Update Token Status</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label>Token Address:</label>
          <input
            type="text"
            name="tokenAddress"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Status:</label>
          <select
            name="tokenStatus"
            value={tokenStatus}
            onChange={(e) => setTokenStatus(e.target.value)}
            required
          >
            <option value="issued">Issued</option>
            <option value="in_progress">In Progress</option>
            <option value="rejected">Rejected</option>
            <option value="audited">Audited</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
        <div>
          <button type="submit">Update Status</button>
        </div>
      </form>

      <h1>Update Certificates to Issued</h1>
      <button onClick={handleUpdateCertificates} disabled={loading}>
        {loading ? "Updating..." : "Update Certificates to Issued"}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}



      <h1>Transfer Digital Asset</h1>
      <form onSubmit={handleTransferSubmit}>
        <div>
          <label>Digital Asset Address:</label>
          <input
            type="text"
            value={digitalAssetAddress}
            onChange={(e) => setDigitalAssetAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Recipient Address:</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Transferring...' : 'Transfer Digital Asset'}
        </button>
      </form>


      <h1>Burn Digital Asset</h1>
      <form onSubmit={handleBurnSubmit}>
        <div>
          <label>Digital Asset Address:</label>
          <input
            type="text"
            value={digitalAssetAddress}
            onChange={(e) => setDigitalAssetAddress(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Burning...' : 'Burn Digital Asset'}
        </button>
      </form>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
    
  );
};

export default CNMSPage;

