require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const rootPath = require('path');
const {v4: uuidv4} = require("uuid");
const {subirArchivo, eliminarArchivo} = require("./helpers");
const csvParser = require("csv-parser");
const {xml2json, json2xml} = require("xml-js");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const app = express();
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

const PORT = process.env.PORT || 5000;


app.get('/', (req, res) => {
    res.json('Servicio corriendo');
});

//csv to json
app.post('/cj', async (req, res) => {
    let ruta = './base64file.csv';
    try {
       /* if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
            return res.status(400).json({msg: 'Sin archivos por subir.'});
        }*/
       
        const fileBase64 = req.body.file;
        //console.log(fileBase64);
        fs.writeFileSync('base64file.csv', fileBase64, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
        
       
        const headers = req.body.header;
        //const nombre = await subirArchivo(req.files);
       // ruta += nombre;
        const json = [];

        

        //con libreria
        if(headers == 'true'){
        fs.createReadStream(ruta)
            .pipe(csvParser())
            .on('data', (row) => {
                json.push(row);
            })
            .on('error', (error) => {
                //eliminarArchivo(ruta);
                res.status(400).json(error);
            })
            .on('end', () => {
               // eliminarArchivo(ruta);
                res.json(json);
                //console.log(json);
            });
        }else{
           
            csv = fs.readFileSync(ruta)
            //console.log(csv);
            const array = csv.toString().split(/\r\n|\n/);     
            
            const csvToJsonResult = [];
            customHeaders = new Array(); 
            var numHeaders = array[0].split(",")
            //console.log(numHeaders);
            for(var x = 0; x < numHeaders.length;x++){
                customHeaders.push('element'+ x);
            }
            //console.log(customHeaders);
            //console.log(array);
            for(var i=0;i<array.length;i++){

                var obj = {};
                var currentline=array[i].split(",");
                //console.log(currentline);
          
                for(var j=0;j<customHeaders.length;j++){
                    obj[customHeaders[j]] = currentline[j];
                }
          
                csvToJsonResult.push(obj);
          
            }
           // console.log(csvToJsonResult);
                /* Convert the final array to JSON */
                //console.log(csvToJsonResult);
                res.json(csvToJsonResult);
        }
    } catch (error) {
        res.status(400).json(error);
        //eliminarArchivo(ruta);
    }
});

//json to csv
app.post('/jc', async (req, res) => {
    const {body} = req;
    if (!body) return res.status(400);
    let ruta = `./uploads/${uuidv4()}.csv`;
    try {
        parametros = new Array();
        var objKeys;
        console.log(Array.isArray(body));
         if (Array.isArray(body)) {
            objKeys = body[0];
         }else{
            objKeys = body;
         }
              
        for (const key in objKeys) {
            var columna = new Object();
            columna.id = key;
            columna.title = key;   
            parametros.push(columna);
        }

        const csvWriter = createCsvWriter({
            path: ruta,
            header: parametros
        });
            
        
        if (Array.isArray(body)) {
            await csvWriter.writeRecords(body);
        } else {
            await csvWriter.writeRecords([body]);
        } console.log(body);
        res.json(fs.readFileSync(ruta,{encoding: 'base64'}))
       /* await res.attachment('response.csv').sendFile(rootPath.join(__dirname, ruta), err => {
            eliminarArchivo(ruta)
        });*/
    } catch (e) {
        res.status(400).json(e);
    }
});




app.listen(PORT, () => console.log('Corriendo en el puerto:', PORT));
