require('dotenv').config();
const fs = require('fs');
const csvParser = require("csv-parser");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const log = require('../../helpers/logger');
const rabbitmq = require('rabbitmqcg-nxg-oih');

const ERROR_PROPERTY = 'Error missing property';
/**
 * Method for transform csv to json
 * @param msg
 * @param cfg
 * @param snapshot
 * @returns {Promise<void>}
 */

module.exports.process = async function processTrigger(msg, cfg, snapshot = {}){
    let ruta = './';
    try {
        log.info("Inside mysqlConnector()");
        log.info("Msg=" + JSON.stringify(msg));
        log.info("Config=" + JSON.stringify(cfg));
        log.info("Snapshot=" + JSON.stringify(snapshot));
        
        let {data} = msg;

        let properties={
            content:null,
            namefile:null,
            headers:null
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

        fs.writeFileSync(properties.namefile, properties.content, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
        ruta += properties.namefile;
        const json = [];

        
        if(properties.headers){
        fs.createReadStream(ruta)
            .pipe(csvParser())
            .on('data', (row) => {
                json.push(row);
            })
            .on('error', (error) => {
                log.info(error);
            })
            .on('end', () => {
               log.info(json);
               log.info('CSV proceso terminado');
               this.emit('data',{data:json});
               log.info('data', json);
            });
        }else{
           
            csv = fs.readFileSync(ruta)            
            const array = csv.toString().split(/\r\n|\n/);     
            const csvToJsonResult = [];
            customHeaders = new Array(); 
            var numHeaders = array[0].split(",")
            for(var x = 0; x < numHeaders.length;x++){
                customHeaders.push('element'+ x);
            }

            for(var i=0;i<array.length;i++){

                var obj = {};
                var currentline=array[i].split(",");
          
                for(var j=0;j<customHeaders.length;j++){
                    obj[customHeaders[j]] = currentline[j];
                }
          
                csvToJsonResult.push(obj);
          
            }
         
            snapshot.lastUpdated = new Date();
            log.info(`New snapshot: ${snapshot.lastUpdated}`);
            this.emit('snapshot', snapshot);

            log.info('data', csvToJsonResult);
            this.emit('data',{data:csvToJsonResult});
          
        }
    } catch (e) {
        log.error(`ERROR: ${e}`);
        this.emit('error', e);
        await rabbitmq.producerErrorMessage(msg.toString(), e.toString());
    }
};

