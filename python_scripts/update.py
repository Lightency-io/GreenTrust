import pandas as pd
from pymongo import MongoClient

# MongoDB Connection Setup
def connect_to_mongo():
    # Database details
    database = "EMSData"
    hostname = '127.0.0.1'

    # Create the MongoDB client
    client = MongoClient(f'mongodb://{hostname}:27017/')

    try:
        # Access the EMSData database
        db = client[database]
        # Print success message
        print(f'Connected to {database} database successfully')
        return db
    except Exception as e:
        print(f"Failed to connect to {database} database: {e}")
        return None

# Function to insert data into a collection
def insert_data_from_file(db, collection_name, file_path, file_type='csv'):
    try:
        # Read data from file based on file type
        if file_type == 'csv':
            df = pd.read_csv(file_path, header = 2)
        elif file_type == 'excel':
            df = pd.read_excel(file_path, header = 2)
        else:
            raise ValueError('Unsupported file type. Use "csv" or "excel".')

        # Only extract the required columns from the sheet
        df_filtered = df[[
            'id',
            'CIF',
            'RazonSocial',
            'CodigoPlanta',  # Column in the sheet for "CodigoPlanta"
            'CIL',
            'Año',
            'Mes',
            'FechaInicio',
            'FechaFin',
            'GarantiaSolicitada',  # Column in the sheet for "GarantiaSolicitada"
            'TipoCesion',
            'idContratoGDO',  # Column in the sheet for "idContratoGDO"
            'idDatosGestion',  # Column in the sheet for "idDatosGestion"
            'Potencia',
            'Tecnologia'
        ]]


        # Set data types explicitly
        df_filtered = df_filtered.astype({
            'id': 'str',
            'CIF': 'str',
            'RazonSocial': 'str',
            'CodigoPlanta': 'str',
            'CIL': 'str',
            'Año': 'str',
            'Mes': 'str',
            'FechaInicio': 'datetime64[ns]',  # Convert to datetime
            'FechaFin': 'datetime64[ns]',     # Convert to datetime
            'GarantiaSolicitada': 'float', # Convert to float
            'TipoCesion': 'str',
            'idContratoGDO': 'str',
            'idDatosGestion': 'str',
            'Potencia': 'float',           # Convert to float
            'Tecnologia': 'str'
        })

        # Add default values for the missing fields ('sum', 'status', 'tokenOnChainId')
        df_filtered['sum'] = df_filtered['Potencia'] + df_filtered['GarantiaSolicitada']
        df_filtered['status'] = 'in_progress'
        df_filtered['tokenOnChainId'] = None

        # Convert DataFrame to list of dictionaries
        data = df_filtered.to_dict(orient='records')

        # Insert data into MongoDB collection
        collection = db[collection_name]
        result = collection.insert_many(data)
        print(f'{len(result.inserted_ids)} documents inserted into {collection_name}')

    except Exception as e:
        print(f"Failed to insert data from file: {e}")

# Main function
if __name__ == "__main__":
    # Connect to MongoDB
    db = connect_to_mongo()

    # File path and type (adjust this path to your file location)
    file_path = 'C:\\Users\\alaa-\\OneDrive\\Bureau\\3-datos para filtros - copia.xlsx'  # Change this to your file path
    file_type = 'excel'  # or 'excel' if you're using an Excel file

    # Insert data into the 'certificates' collection from the file
    if db is not None:
        insert_data_from_file(db, 'certificates', file_path, file_type)

        # Example: Print all collections in the database
        print("Collections in the database:", db.list_collection_names())
