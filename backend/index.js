const express = require("express")
const compression = require("compression")
const multer  = require('multer')
const path = require("path")
const crypto = require("crypto");
const cors = require('cors');
const CSV = require("csv-parse");
const sqlite3 = require('sqlite3').verbose();
const XlsxPopulate = require('xlsx-populate');
const XLSX = require("xlsx");
const userRoute = require('./routes/userRouter.js');
const mongoose = require("mongoose")
const demandController = require('./controller/demandController.js');
const demandRoute = require('./routes/demandRoute.js');
const { initializeDatabases } = require('./db.js');
const { getGreenTrustModel, getEMSDataModel, getGreenTrustUserModel } = require('./db.js');
const { verifyToken } = require("./middleware/authUtils.js");
const app = express()
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

app.use(cors(
    {
        origin: "*"
    }
))
app.use("/auth",userRoute)
app.get("/healthy", (req, res) => {return res.json({msg : 'Hello World!'})});


// const database1 = "GreenTrust";
// const hostname1 = '127.0.0.1';

// const database2 = "EMSData";
// const hostname2 = '127.0.0.1';

// // Initialize models as null to avoid direct use before they are defined
// let GreenTrustModel = null;
// let EMSDataModel = null;

// const connectionGreenTrustPromise = new Promise((resolve, reject) => {
//     const connectionGreenTrust = mongoose.createConnection(`mongodb://${hostname1}:27017/${database1}`, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });

//     connectionGreenTrust.on('connected', () => {
//         console.log(`Connected to database: ${database1}`);
//         GreenTrustModel = connectionGreenTrust.model('Data', Data);
//         resolve(GreenTrustModel);
//     });

//     connectionGreenTrust.on('error', (err) => {
//         console.error(`Error connecting to database ${database1}:`, err);
//         reject(err);
//     });
// });

// const connectionEMSDataPromise = new Promise((resolve, reject) => {
//     const connectionEMSData = mongoose.createConnection(`mongodb://${hostname2}:27017/${database2}`, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });

//     connectionEMSData.on('connected', () => {
//         console.log(`Connected to database: ${database2}`);
//         EMSDataModel = connectionEMSData.model('Data', Data, 'certificates');
//         resolve(EMSDataModel);
//     });

//     connectionEMSData.on('error', (err) => {
//         console.error(`Error connecting to database ${database2}:`, err);
//         reject(err);
//     });
// });

// // Export Promises that resolve to the initialized models
// module.exports = {
//     getGreenTrustModel: connectionGreenTrustPromise,
//     getEMSDataModel: connectionEMSDataPromise
// };
// const findEMSData = async () => {
//     try {
//         const data = await EMSDataModel.find();
//         console.log("EMSData Data:", data);
//     } catch (err) {
//         console.error("Error fetching data from EMSData:", err);
//     }
// };

// findEMSData()

// the unbreakable filter 🤪
const filter = function (_, file, cb) {
    if(file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        cb(null, true)
    } else {
        cb(new Error('The file format is not supported'))
    }
}

// for MVP purposes, file mapping will be stored in memory
let files = {}
const db = new sqlite3.Database(':memory:');
const storage = multer.memoryStorage()

const upload = multer({ 
    storage,
    // dest: path.join(__dirname, "uploads/"),
    fileFilter: filter,
    limits: {
        fieldSize:  10 * 1024 * 1024,
    }
})


app.use("/demand", demandRoute);
app.use(compression())
app.use(express.json())  


function createTableBuilder(uuid) {
    return `CREATE TABLE ${uuid} (
        'id' TEXT,
        'CIF' TEXT,
        'RazonSocial' TEXT,
        'CodigoPlanta' TEXT,
        'CIL' TEXT,
        'Año' TEXT,
        'Mes' TEXT,
        'FechaInicio' TEXT,
        'FechaFin' TEXT,
        'GarantiaSolicitada' REAL,
        'TipoCesion' TEXT,
        'idContratoGDO' TEXT,
        'idDatosGestion' TEXT,
        'Potencia' REAL,
        'Tecnologia' TEXT
    )`;
}
app.route("/files")
    .get(function (_, res) {
        res.status(200).json(Object.values(files).map(toJSON)).end()
    })
    .post(upload.single("table"), function (req,res) {
            const uuid = crypto.randomUUID()
            const file = { uuid, filename: req.file.originalname, size: req.file.size, table_id: makeid(10)}
            const workbook = XLSX.read(req.file.buffer);
            const json = XLSX.utils.sheet_to_json(workbook.Sheets["Hoja1"], {range: 2});
            db.run(createTableBuilder(file.table_id), (err) => {
                if(err) throw err;
                const stmt = db.prepare(`INSERT INTO ${file.table_id}  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                for(const row of json.map(e => ({...e, FechaInicio: XlsxPopulate.numberToDate(e.FechaInicio).getTime(), FechaFin: XlsxPopulate.numberToDate(e.FechaFin).getTime()}))) {
                    stmt.run(Object.values(row).slice(0, -2));
                }
                stmt.finalize();

                files[uuid] = file
                res.status(201).json(toJSON(file)).end()
            })
    })

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

app.route("/files/:uuid")
    .get(function (req, res, next) {
        const file = files[req.params.uuid]
        if(!file) {
            next(new Error("File not found"))
        }

        db.all(`select * from ${file.table_id}`, (err, rows) => {
            if(err) throw err;
            res.status(200).json(rows.map(r => ({...r, key:r.id}))).end()
        })
    })

app.get("/", function (_, res) {
    res.sendFile(path.join(__dirname, "views", "index.html"))
})


function toJSON({uuid, filename, size}) {
    return {uuid, filename, size, key:uuid}
}

function all_p(f) {
    return new Promise((res, rej) => {
        f.all((err, rec) => {
            if(err) rej(err);
            res(rec)
        })
    })
}

function get_p(f, r) {
    return new Promise((res, rej) => {
        f.all(r, (err, rec) => {
            if(err) rej(err);
            res(rec)
        })
    })
}

app.post("/download", verifyToken, async (req, res, next) => {
  try {
    // Extract keys and uuid from request body
    const { keys, uuid } = req.body;

    // Extract userEmail from the authenticated user in JWT
    const userEmail = req.user.email;
    console.log("wuuuuj", userEmail)

    // Check if 'keys' or 'uuid' is missing
    if (!keys) {
      return res.status(400).json({ message: "Missing keys in request body." });
    }

    if (!uuid) {
      return res.status(400).json({ message: "Missing uuid in request body." });
    }

    // Retrieve the file based on uuid
    const file = files[uuid];
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    // Prepare and execute the SQL statement to fetch records
    const stmt_exp = db.prepare(
      `SELECT *, SUM(GarantiaSolicitada) as sum FROM ${file.table_id} WHERE id IN (${keys.toString()}) GROUP BY CodigoPlanta`
    );
    const recs_exp = await all_p(stmt_exp);
    // await recs_exp.forEach((rec) => {
    //   rec.CIF = bcrypt.hash(rec.CIF, 10);
    // });

    // Save the contracts to the database using the updated saveContracts function
    const data = await demandController.saveContracts(recs_exp, userEmail);

    // Send the saved contracts as response
    res.status(201).json({
      message: "Contracts saved successfully.",
      data,
    });
  } catch (error) {
    console.error("Error in /download route:", error);
    // Pass the error to Express's error handling middleware
    res.status(500).json({ message: error.message || "Internal Server Error." });
  }
});


app.use(function (err, req, res, next) {
    console.error(err)
    res.status(402).json({ error: err.message })
})


async function addFieldToExistingDocs() {
    const Data = getGreenTrustModel();
    try {
      const result = await Data.updateMany(
        { status: { $exists: true } }, // Find documents without this field
        { $set: { status: "in_progress" } } // Set a default value
      );
      console.log(`Documents updated: ${result.nModified}`);
    } catch (error) {
      console.error('Error updating documents:', error);
    } finally {
      mongoose.disconnect();
    }
  }
// Initialize the databases and then start the server
initializeDatabases()
    .then(() => {
        //addFieldToExistingDocs()
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize databases: ", err);
    });


