var database = require('../Models/DBHandler');
var https = require('https');

async function uploadFile(req) {
    return new Promise((resolve, reject) => {
        let fileName = req.headers['x-filename'];
        const fs = require('fs');
        const writeStream = fs.createWriteStream(`./user_files/${fileName}`);
        req.on('data', chunk => {
            writeStream.write(chunk);
        });
        req.on('end', async () => {
            writeStream.end();
            let size = 0;
            let extension = fileName.split('.').pop();
            try {
                // stats=fs.stat(`./user_files/${fileName}`,async (err,stats)=>{
                //         if(err){
                //             console.log(err)
                //         }else{
                //             console.log(stats)
                //         }
                // });
                // console.log("stats:",stats);
                ///TODO: solve the size not being
                let result = await database.uploadFile({ user_id: req.headers['x-user'], filename: fileName, scope: req.headers['x-scope'], size: size, extension: extension });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', err => {
            writeStream.end();
            reject(err);
        })
    });
}

// async function uploadToDrives(req) {
//     return new Promise((resolve, reject) => {
//         let fileName = req.headers['x-filename'];
//         const fs = require('fs');
//         fs.readFile(`./user_files/${fileName}`, function read(err, data) {
//             if (err) {
//                 throw err;
//             }
//             uploadToDropbox(data);
//             resolve("OK");
//         });
//     });
// }

async function uploadToDropbox(req) {
    let fileName = req.headers['x-filename'];
    const fs = require('fs');
    let sessionToken=await database.getSessionToken({ cloud: 'db', idUser: 1 }); /// TODO: GET USER DINAMICALLY 
    fs.readFile(`./user_files/${fileName}`, function read(err, data) {
        let options = {
            method: 'POST',
            hostname: 'content.dropboxapi.com',
            path: '/2/files/upload',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Dropbox-API-ARG': `{"path":"/${req.headers['x-scope']}/${fileName}","mode":"add","autorename":true,"mute":false}`,
                'Content-Type': 'application/octet-stream'
            }
        }
        const request = https.request(options, function (res) {
            res.on('data', function (d) {
                process.stdout.write(d);
            });
        });
        request.write(data);
        request.end();
    });
    await database.addShard({idUser:1,filename:fileName,shardname:fileName,location:'dropbox'});
}

async function getUserFiles(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await database.getUserFiles({ user_id: req.headers['x-user'], scope: req.headers['x-scope'] });
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    uploadFile: uploadFile,
    uploadToDropbox: uploadToDropbox,
    getUserFiles: getUserFiles
}