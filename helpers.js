const {v4: uuidv4} = require("uuid");
const path = require('path');
const fs = require("fs");

const subirArchivo = async (files) => {
    return new Promise((resolve, reject) => {
        const {file} = files;
        const nombreCortado = file.name.split('.');
        //ultima posicion
        const extension = nombreCortado[nombreCortado.length - 1];
        const nombreTemp = uuidv4() + '.' + extension;
        const uploadPath = path.join(__dirname, './uploads/', nombreTemp);
        file.mv(uploadPath, (err) => {
            if (err)
                reject(err);
            resolve(nombreTemp);
        });
    });
}

const eliminarArchivo=(archivo)=>{
    if (fs.existsSync(archivo)) {
        fs.unlinkSync(archivo);
    }
}

module.exports = {
    subirArchivo,
    eliminarArchivo
};
