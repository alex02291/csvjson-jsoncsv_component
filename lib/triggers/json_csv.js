require('dotenv').config();
const fs = require('fs');
const csvParser = require("csv-parser");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const log = require('../../helpers/logger');
const rabbitmq = require('rabbitmqcg-nxg-oih');
const { info } = require('console');


const ERROR_PROPERTY = 'Error missing property';
/**
 * Method for transform json to csv
 * @param msg
 * @param cfg
 * @param snapshot
 * @returns {Promise<void>}
 */


module.exports.process = async function processTrigger(msg, cfg, snapshot = {}){
    
    try {
        log.info("Inside processTrigger()");
        log.info("Msg=" + JSON.stringify(msg));
        log.info("Config=" + JSON.stringify(cfg));
        log.info("Snapshot=" + JSON.stringify(snapshot));

        let {data} = msg;

        let properties={
            namefile :null,
            content:null
        };
        
        if (!data) {
            this.emit('error', `${ERROR_PROPERTY} data`);
            throw new Error(`${ERROR_PROPERTY} data`);
        }

        Object.keys(properties).forEach((value) => {
            if (data.hasOwnProperty(value)) {
                properties[value] = data[value];
            } else if (cfg.hasOwnProperty(value)) {
                properties[value] = cfg[value];
            } else {
                log.error(`${ERROR_PROPERTY} ${value}`);
                throw new Error(`${ERROR_PROPERTY} ${value}`);
            }
        });
        let ruta = '/usr/src/app/lib/triggers/uploads/';
        ruta += properties.namefile;
        log.info(ruta);
        parametros = new Array();
        var objKeys;
        let bodyJson = JSON.parse(Buffer.from(properties.content, 'base64').toString('ascii'));
        log.info(bodyJson);
         if (Array.isArray(bodyJson)) {
            objKeys = bodyJson[0];
         }else{
            objKeys = bodyJson;
         }
             
        for (const key in objKeys) {
            var columna = new Object();
            columna.id = key;
            columna.title = key;   
            parametros.push(columna);
        }

        fs.writeFileSync(ruta," ",{encoding:"utf8"});

        const csvWriter = createCsvWriter({
            path: ruta,
            header: parametros
        });
            
      

        
        if (Array.isArray(bodyJson)) {
            await csvWriter.writeRecords(bodyJson);
        } else {
            await csvWriter.writeRecords([bodyJson]);
        }
        log.info('CSV created');

        snapshot.lastUpdated = new Date();
        log.info(`New snapshot: ${snapshot.lastUpdated}`);
        this.emit('snapshot', snapshot);
        
        log.info('data',fs.readFileSync(ruta,{encoding: 'base64'}));
        this.emit('data',{data:fs.readFileSync(ruta,{encoding: 'base64'})});
        
    } catch (e) {
        log.error(`ERROR: ${e}`);
        this.emit('error', e);
        await rabbitmq.producerErrorMessage(msg.toString(), e.toString());
    }
};

