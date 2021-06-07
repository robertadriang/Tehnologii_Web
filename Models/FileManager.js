var database = require('../Models/DBHandler');
var https = require('https');
const { request } = require('http');

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

async function uploadToGoogle(req){
    let fileName = req.headers['x-filename'];
    const fs = require('fs');
    let fileId="";
    let sessionToken=await database.getSessionToken({ cloud: 'gd', idUser: 1 });
    fs.readFile(`./user_files/${fileName}`, function read(err, data) {
        let metadata={
            mimeType:'text/plain',
            name:fileName,
            title:fileName
        };
        const boundary='@@@@###@@@@';
        const innerDelimiter="\r\n--"+boundary+"\r\n";
        const closeDelimiter="\r\n--"+boundary+"--";
        let options={
            'method':'POST',
            'hostname':'www.googleapis.com',
            'path':'/upload/drive/v3/files?uploadType=multipart',
            'headers':{
                'uploadType':'multipart',
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type':`multipart/form-data; boundary=${boundary}`
            }
        }
        let body=innerDelimiter+
                "Content-Disposition: form-data; name=\"resource\"\r\n" +
                "Content-Type: application/json\r\n" +
                "\r\n"+
                JSON.stringify(metadata)+"\r\n"+
                innerDelimiter+
                "Content-Disposition: form-data; name=\"media\"\r\n"+
                "Content-Type:text/plain\r\n"+
                "\r\n"+
                data+
                "\r\n"+
                closeDelimiter;

        const request=https.request(options,function (res){
            res.on("data",function(d){
                process.stdout.write(d);
                fileId=JSON.parse(d.toString()).id;
                database.addShard({idUser:1,filename:fileName,shardname:fileId,location:'google'});
            });
        });
        request.write(body);
        request.end(); 
    }); 
}

async function uploadToOneDrive(req){
    let fileName = req.headers['x-filename'];
    const fs = require('fs');
    let sessionToken=await database.getSessionToken({ cloud: 'od', idUser: 1 });
    let options={
        method: 'POST',
        hostname: 'graph.microsoft.com',
        path:`/v1.0/drive/root:/UNST/${fileName}:/createUploadSession`,
        headers:{
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
        }
    };
    let body=JSON.stringify(`{
        "item":
            {
                "name":${fileName}
            }
        }`);

    let data="";
    let uploadUrl="";
    const request=https.request(options,function(res){
        res.on("data",function (d){
            data+=d;
        });
        res.on('end',()=>{
            console.log(data);
            uploadUrl=JSON.parse(data).uploadUrl;
            console.log("URL",uploadUrl);
            let stat=fs.statSync(`./user_files/${fileName}`);
            fs.readFile(`./user_files/${fileName}`, function read(err, data) {
                console.log("URL PART:",uploadUrl.substring(uploadUrl.indexOf("/rup/")))
                let options2={
                    method:'PUT',
                    hostname:'api.onedrive.com',
                    headers:{
                        'Content-Length':stat.size
                    },
                    path:uploadUrl.substring(uploadUrl.indexOf("/rup/"))
                    }
                    const request = https.request(options2, function (res) {
                        res.on('data', function (d) {
                            process.stdout.write(d);
                        });
                    });
                request.write(data);
                request.end();
                database.addShard({idUser:1,filename:fileName,shardname:fileName,location:'onedrive'});
                });
        })
    });
     request.write(body);
     request.end(); 
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
    uploadToGoogle:uploadToGoogle,
    uploadToOneDrive:uploadToOneDrive,
    getUserFiles: getUserFiles
}