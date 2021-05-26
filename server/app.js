const express = require("express");
const cors = require("cors");
const multer = require('multer');
const morgan = require('morgan');
var body_parser = require('body-parser');
const mysqlConnection = require('./database');
const path = require('path');
const fs = require('fs').promises;

const app = express();

app.use(body_parser.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    mysqlConnection.query('SELECT * FROM  products', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});

app.get("/upload", (req, res) => {
    mysqlConnection.query('SELECT * FROM  products', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan('dev'));


// Ruta para guardar imagenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        callBack(null, file.originalname);
    }
});

const upload = multer({ storage })


// Rutas
app.get("/upload", (req, res) => {
    mysqlConnection.query('SELECT * FROM  products', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});

app.post('/file', upload.single('file'), (req, res, next) => {
    
    const file = req.file;
    var precio = req.body.precio;
    const filesImg = {

        id: null,
        nombre: file.filename,
        imagen: file.path,
        precio: precio,
        fecha_creacion: null
    }

    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400;
        return next(error)
    }

    res.send(file);
    console.log(filesImg);

    mysqlConnection.query('INSERT INTO products set ?', [filesImg]);

});


app.delete('/delete/:id', (req, res) => {

    const { id } = req.params;
    deleteFile(id);
    mysqlConnection.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: "The file was deleted" });
});

function deleteFile(id) {

    mysqlConnection.query('SELECT * FROM  products WHERE id = ?', [id], (err, rows, fields) => {
        [{ imagen }] = rows;
        fs.unlink(path.resolve('./' + imagen)).then(() => {
            console.log('Imagen eliminada');
        }).catch(err => { console.error("File doesn't exist") })
    });

}

//Puerto de conexion
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});