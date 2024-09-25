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


//db connection
const database = "GreenTrust" 
const hostname = '127.0.0.1'

mongoose.set('debug', true)
mongoose.Promise = global.Promise
mongoose
    .connect(`mongodb://${hostname}:27017/${database}`)
    .then(() => {
        console.log(`connected to  ${database}`)
    })
    .catch(err => {
        console.log(err)
    })

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



app.use(compression())
app.use(express.json())  

/*{
    id: 855126,
    CIF: 'B92478296',
    RazonSocial: 'Angulo Anaya S.L.',
    CodigoPlanta: 'ANGULOANAYA',
    CIL: 'ES0031000000400038QB1F001',
    'Año': 2024,
    Mes: 1,
    FechaInicio: 45292,
    FechaFin: 45351,
    GarantiaSolicitada: 1,
    TipoCesion: 'Ced_NX',
    idContratoGDO: 21491,
    idDatosGestion: 572127,
    Potencia: 0.15,
    Tecnologia: 'HIDRAULICA',
    NombreFicheroExcel: 'Expedicion_638557050605449585_01',
    ID_Datatable: 855126
}*/
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

    app.post("/download", async (req,res,next) => {
        const { uuid } = req.body;
        if (!uuid) return res.status(401).end();
    
        try {
            const file = files[uuid];
            if (!file) {
                return next(new Error("File not found"));
            }
    
            // Fetch all the data from the table
            const stmt_exp = db.prepare(`SELECT *, SUM(GarantiaSolicitada) as sum FROM ${file.table_id} GROUP BY CodigoPlanta`);
            const recs_exp = await all_p(stmt_exp);
    
            const stmt_prod = db.prepare(`SELECT * FROM ${file.table_id}`);
            const recs_prod = await all_p(stmt_prod);
    
            const responseData = {
                expedicion: recs_exp,
                produccionMensual: recs_prod
            };
    
            // Send the response
            res.json(responseData);
    
        } catch (error) {
            console.error("Error fetching data:", error);
            next(error); // Pass the error to the error handler
        }


})

app.use(function (err, req, res, next) {
    console.error(err)
    res.status(402).json({ error: err.message })
})

app.listen(3000, function () {
    console.log("Server is running on port 3000")
})