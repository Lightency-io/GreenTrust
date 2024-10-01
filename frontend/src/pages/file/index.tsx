import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Button, Flex, Input, InputRef, Space, Table, TableColumnType, DatePicker, message } from 'antd';
import { FileType } from "../../component/FileCard";
import { FileAddOutlined, SearchOutlined } from "@ant-design/icons";
import { FilterDropdownProps, TableRowSelection } from "antd/es/table/interface";
import { useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { DateTime } from "luxon";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween'
import App from "../Nav/Menu.tsx";
import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey, AccountAddress, Bool, U64, MoveVector, MoveString, U8, Hex } from "@aptos-labs/ts-sdk";
import { HexString } from "aptos";

dayjs.extend(isBetween)

const { RangePicker } = DatePicker;

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

function UploadPage() {
  const { uuid } = useParams();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInput = useRef<InputRef>(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [range, setRange] = useState<Array<dayjs.Dayjs> | null>(null);


  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);


  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string): TableColumnType<FileType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });



  const { isPending, data } = useQuery<RecordType[]>({
    queryKey: ['file', uuid], async queryFn() {
      return (await (await fetch(`http://localhost:3000/files/${uuid}`)).json()).map(e => ({ ...e, FechaInicio: DateTime.fromMillis(Number(e.FechaInicio)).setLocale("es-ES"), FechaFin: DateTime.fromMillis(Number(e.FechaFin)).setLocale("es-ES") }))
    }
  })

  if (isPending) {
    return null;
  }
  const data_filtered = data!.filter((e) => {
    if (!range || !range[0] || !range[1]) return true;
    return dayjs(e.FechaInicio.toJSDate()).isBetween(range[0], range[1], "day", '[]')
  })

  function download(filename: string, url: string) {
    var element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const down = async () => {
    setLoading(true);
  
    try {
      // Post data to the database first
      await fetch('http://localhost:3000/download', {
        body: JSON.stringify({ keys: selectedRowKeys, rows: selectedRows, uuid: uuid }),
        method: "POST",
        headers: {
          "content-type": "application/json"
        }
      });
  
      message.success("Demand created successfully", 2);
  
      // Fetch certificates after posting to the database
      const fetchedCertificates = await fetchCertificates();
      
      // Create collections and mint tokens based on fetched certificates
      await createCollectionsAndMintTokens(fetchedCertificates);
  
    } catch (error) {
      console.error("Error in down function:", error);
      message.error("Failed to create demand or perform blockchain operations", 2);
    } finally {
      setLoading(false);
    }
  };


// Fetch Certificates from API (returning the certificates instead of using state)
const fetchCertificates = async (): Promise<Certificate[]> => {
  try {
    const response = await fetch("http://localhost:3000/demand/certificatesInProgress");
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const result = await response.json();
    return result;  // Return the fetched certificates
  } catch (error) {
    console.error("Error fetching certificates:", error);
    throw error;
  }
};



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
  const createCollectionsAndMintTokens = async (certificates: Certificate[]) => {
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
        
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        const findTokenWithRetry = async (targetTokenName: string, maxRetries: number = 3, delayMs: number = 2000) => {
          let attempts = 0;
        
          while (attempts < maxRetries) {
            // Fetch the tokens after mint
            const tokensAfterMint = await aptos.getAccountOwnedTokens({
              accountAddress: accountAdmin.accountAddress,
            });
        
            // Search for the token by its name
            const token = tokensAfterMint.find(
              (token: any) => token.current_token_data.token_name === targetTokenName
            );
        
            if (token) {
              return token; // Return the found token if it matches
            }
        
            // If token is not found, retry after a delay
            attempts++;
            if (attempts < maxRetries) {
              console.log(`Retry ${attempts}/${maxRetries}: Token not found. Retrying in ${delayMs}ms...`);
              await delay(delayMs);
            }
          }
        
          // If token is not found after maxRetries
          return null;
        };

        // Define the target token name for searching
        const targetTokenName = certificate.RazonSocial + "'s GO - ID: " + certificate.id.toString();

        const token = await findTokenWithRetry(targetTokenName);
        
        if (token) {
          console.log("Token found:", token.current_token_data?.token_data_id);
          
          const tokenOnChainId = token.current_token_data?.token_data_id; // Extract the token_data_id from the found token
        
          // Now call the API to update the tokenOnChainId
          try {
            const response = await fetch(`http://localhost:3000/demand/updateTokenOnChainId/${certificate.RazonSocial}/${certificate.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tokenOnChainId: tokenOnChainId, // Send the tokenOnChainId
              }),
            });
        
            if (!response.ok) {
              throw new Error(`Failed to update tokenOnChainId: ${response.statusText}`);
            }
        
            const result = await response.json();
            console.log("API Response:", result);
          } catch (error) {
            console.error("Error calling update API:", error);
          }
          
        } else {
          console.log("Token not found with name:", targetTokenName);
        }

      } catch (error) {
        console.error("Error creating collection or minting token:", error);
      }
    }
  };

  const hasSelected = selectedRowKeys.length > 0;

  const onSelectChange = (newSelectedRowKeys: React.Key[], selection: unknown) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows((selection as RecordType[]).map(e => e.CIF));
    console.log('selectedRows changed: ', selection);

  };

  const rowSelection: TableRowSelection<RecordType> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };


  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      fixed: "left",
      ...getColumnSearchProps('id'),
    },
    {
      title: 'CIF',
      dataIndex: 'CIF',
      key: 'CIF',
      ...getColumnSearchProps('CIF'),
    },
    {
      title: 'RazonSocial',
      dataIndex: 'RazonSocial',
      key: 'RazonSocial',
      ...getColumnSearchProps('RazonSocial'),
    },
    {
      title: 'CodigoPlanta',
      dataIndex: 'CodigoPlanta',
      key: 'CodigoPlanta',
      ...getColumnSearchProps('CodigoPlanta'),
    },
    {
      title: 'CIL',
      dataIndex: 'CIL',
      key: 'CIL',
      ...getColumnSearchProps('CIL'),
    },
    {
      title: 'Año',
      dataIndex: 'Año',
      key: 'Año',
      ...getColumnSearchProps('Año'),
    },
    {
      title: 'Mes',
      dataIndex: 'Mes',
      key: 'Mes',
      ...getColumnSearchProps('Mes'),
    },
    {
      title: 'FechaInicio',
      dataIndex: 'FechaInicio',
      key: 'FechaInicio',
      ...getColumnSearchProps('FechaInicio'),
    },
    {
      title: 'FechaFin',
      dataIndex: 'FechaFin',
      key: 'FechaFin',
      ...getColumnSearchProps('FechaFin'),
    },
    {
      title: 'GarantiaSolicitada',
      dataIndex: 'GarantiaSolicitada',
      key: 'GarantiaSolicitada',
      ...getColumnSearchProps('GarantiaSolicitada'),
    },
    {
      title: 'TipoCesion',
      dataIndex: 'TipoCesion',
      key: 'TipoCesion',
      ...getColumnSearchProps('TipoCesion'),
    },
    {
      title: 'idContratoGDO',
      dataIndex: 'idContratoGDO',
      key: 'idContratoGDO',
      ...getColumnSearchProps('idContratoGDO'),
    },
    {
      title: 'idDatosGestion',
      dataIndex: 'idDatosGestion',
      key: 'idDatosGestion',
      ...getColumnSearchProps('idDatosGestion'),
    },
    {
      title: 'Potencia',
      dataIndex: 'Potencia',
      key: 'Potencia',
      ...getColumnSearchProps('Potencia'),
    },
    {
      title: 'Tecnologia',
      dataIndex: 'Tecnologia',
      key: 'Tecnologia',
      ...getColumnSearchProps('Tecnologia'),
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      fixed: 'right',
      render: (_: any, record: RecordType) => {
        return <Button type="primary" icon={<FileAddOutlined />} size="large" onClick={() => {
          fetch('http://localhost:3000/download', {
            body: JSON.stringify({ keys: [record.id], rows: [record.CIF], uuid: uuid }),
            method: "POST",
            headers: {
              "content-type": "application/json"
            }
          }).then(message.success("Demande created successfully", 2));
        }} />;
      },
    }
  ];

  return <>
  
  <Flex gap="middle" vertical>
  <App/>
    <Flex align="center" gap="middle">
      <Button type="primary" onClick={down} disabled={!hasSelected} loading={loading}>
        Apply Selected Demand
      </Button>
      {hasSelected ? `Selected ${selectedRowKeys.length} items` : null}
      <RangePicker value={range} onChange={(a) => {
        setRange(a)
      }}></RangePicker>
    </Flex>
    <Table<RecordType> rowSelection={rowSelection} dataSource={data_filtered!.map(e => ({ ...e, FechaInicio: e.FechaInicio.toLocaleString(), FechaFin: e.FechaFin.toLocaleString() }))} columns={columns} />
  </Flex> </>
}

export type RecordType = {
  id: string,
  CIF: string,
  RazonSocial: string,
  CodigoPlanta: string,
  CIL: string,
  'Año': string,
  Mes: string,
  FechaInicio: DateTime,
  FechaFin: DateTime,
  GarantiaSolicitada: string,
  TipoCesion: string,
  idContratoGDO: string,
  idDatosGestion: string,
  Potencia: string,
  Tecnologia: string,
  NombreFicheroExcel: string,
  ID_Datatable: string
}



export default UploadPage
