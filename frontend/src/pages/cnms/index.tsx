import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey, AccountAddress, Bool, U64, MoveVector, MoveString, U8, Hex } from "@aptos-labs/ts-sdk";
import React, { useEffect, useState } from 'react';
import { HexString } from "aptos";

interface Certificate {
  id: number;
  CIF: string;
  RazonSocial: string;
  FechaInicio: string;
  FechaFin: string;
  Tecnologia: string;
  Potencia: string;
  status: string;
}

const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

const privateKey = new Ed25519PrivateKey(import.meta.env.VITE_PRIVATE_KEY!);
const address = AccountAddress.from(import.meta.env.VITE_ACCOUNT_ADDRESS!);
const accountAdmin = Account.fromPrivateKey({ privateKey, address });

function stringToHex(str: string): string {
    return str
      .split('')
      .map((char) => char.charCodeAt(0).toString(16))
      .join("");
  }

const CNMSPage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [tokenStatus, setTokenStatus] = useState<string>("in_progress");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        function: "0x6e91c7b2de00d2bd7224d113dfd67e3fe7f84a8cc0bdef547e15dc338a871621::guarantee_of_origin::create_collection",
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
        function: "0x6e91c7b2de00d2bd7224d113dfd67e3fe7f84a8cc0bdef547e15dc338a871621::guarantee_of_origin::mint",
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
  
      const data = await response.json();
      const certificatesInProgress = data.certificates;
  
      if (!certificatesInProgress.length) {
        setError("No certificates found with status 'in_progress'");
        setLoading(false);
        return;
      }
  
      // Step 2: Iterate over each certificate and update status on-chain and backend
      for (const certificate of certificatesInProgress) {
        const tokenAddress = certificate.tokenOnChainId;
  
        if (!tokenAddress) {
          throw new Error(`tokenOnChainId is missing for certificate: ${certificate.id}`);
        }
  
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

  return (
    <div>
      <h1>Create Collections and Mint Tokens from Certificates</h1>
      <button onClick={createCollectionsAndMintTokens}>Start Process</button>
      {transactionHash && <p>Last Transaction Hash: {transactionHash}</p>}

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
    </div>
    
  );
};

export default CNMSPage;

