var database = require('../Models/DBHandler');
var https = require('https');
const { request } = require('http');
const cm=require('../Models/CloudManager');

/* Upload a file into a temporary storage room until the split is complete */
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
                let stat=fs.statSync(`./user_files/${fileName}`);
                let result = await database.uploadFile({ user_id: req.headers['x-user'], filename: fileName, scope: req.headers['x-scope'], size: stat.size, extension: extension });
                let connectedDrives=await cm.getClouds(req.headers['x-user']);
                if(connectedDrives.dropbox==='Connected'){
                    console.log('Inseram fisierul in dropbox');
                    uploadToDropbox(req);
                }
                if(connectedDrives.google==='Connected'){
                    console.log('Inseram fisierul in google drive');
                    uploadToGoogle(req);
                }if(connectedDrives.onedrive==='Connected'){
                    console.log('Inseram fisierul in onedrive');
                    uploadToOneDrive(req);
                }
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

/* Upload a file to Dropbox */
async function uploadToDropbox(req) {
    let fileName = req.headers['x-filename'];
    let userId=req.headers['x-user'];/// TODO: GET USER DINAMICALLY 
    const fs = require('fs');
    let sessionToken=await database.getSessionToken({ cloud: 'db', idUser: userId }); 
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
                let fileId=JSON.parse(d.toString()).id;
                database.addShard({idUser:userId,filename:fileName,shardname:fileId,location:'dropbox'});
            });
        });
        request.write(data);
        request.end();
    });
}

async function downloadFromDropbox(req){
    let fileName=`${decodeURIComponent(req.params.fileName)}.${req.headers['file-extension']}`;
    let userId=req.headers['x-user'];
    let sessionToken=await database.getSessionToken({ cloud: 'db', idUser: userId });
    let shardId=await database.getShard({id:userId,filename:fileName,location:'dropbox'});
    const fs = require('fs');
    let downloadName=`${decodeURIComponent(req.params.fileName)}-db-d.${req.headers['file-extension']}`;
    const writeStream = fs.createWriteStream(`./user_files/${downloadName}`,'binary');
    let options={
        method:'POST',
        hostname: 'content.dropboxapi.com',
        path: '/2/files/download',
        headers:{
            'Authorization': `Bearer ${sessionToken}`,
            'Dropbox-API-ARG': `{"path":"${shardId}"}`,
            'Content-Type': 'application/octet-stream'
        }
    }
    let data = "";
    let response={};
    console.log('Starting request');
    const request=https.request(options,function(res){
        res.setEncoding('binary');
        res.on('data',function(d){
            data+=d;
        });
        res.on('end',()=>{
            try{
                response = JSON.parse(data).error; 
            }catch (e) {
               writeStream.write(data);
               writeStream.end();
            }
        });
    });
    request.end();
}

/* Upload a file to GoogleDrive
    This process requires a JSON that contains file details like name or type AND the actual file.
    Both are send in the body and should be formatted according to the RFC2387 standard
    Look here for the body formatting explanation: https://datatracker.ietf.org/doc/html/rfc2387 */
async function uploadToGoogle(req){
    let fileName = req.headers['x-filename'];
    let userId=req.headers['x-user'];
    const fs = require('fs');
    let fileId="";
    let sessionToken=await database.getSessionToken({ cloud: 'gd', idUser: userId });
    fs.readFile(`./user_files/${fileName}`,'binary', function read(err, data) {
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
                database.addShard({idUser:userId,filename:fileName,shardname:fileId,location:'google'});
            });
        });
        request.write(body);
        request.end(); 
    }); 
}

async function downloadFromGoogle(req){
    let fileName=`${decodeURIComponent(req.params.fileName)}.${req.headers['file-extension']}`;
    let userId=req.headers['x-user'];
    let sessionToken=await database.getSessionToken({ cloud: 'gd', idUser: userId });
    let shardId=await database.getShard({id:userId,filename:fileName,location:'google'});
    const fs = require('fs');
    let downloadName=`${decodeURIComponent(req.params.fileName)}-gd-d.${req.headers['file-extension']}`;
    const writeStream = fs.createWriteStream(`./user_files/${downloadName}`,'binary');
    let options={
        method:'GET',
        hostname:'www.googleapis.com',
        path:`/drive/v3/files/${shardId}?alt=media`,
        headers:{
            'Authorization':`Bearer ${sessionToken}`
        }
    };
    let data = "";
    let response={};
    const request=https.request(options,function(res){
        res.setEncoding('binary');
        res.on('data',function(d){
            data+=d;
        });
        res.on('end',()=>{
            try{
                response = JSON.parse(data).error; 
            }catch (e) {
               writeStream.write(data);
               writeStream.end();
            }
        });
    });
    request.end();
}

/* Upload a file to OneDrive 
    This is a 2-step process 
    1. Create a upload session (Because in theory we are handling big files)
    2. Upload chunks of the file
    3. If the upload fails during the transferr we should reinitiate the process from where we started
*/
async function uploadToOneDrive(req){
    let fileName = req.headers['x-filename'];
    let userId=req.headers['x-user'];
    const fs = require('fs');
    let sessionToken=await database.getSessionToken({ cloud: 'od', idUser: userId });
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
            uploadUrl=JSON.parse(data).uploadUrl;
            let stat=fs.statSync(`./user_files/${fileName}`);
            fs.readFile(`./user_files/${fileName}`, function read(err, data) {
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
                            fileId=JSON.parse(d.toString()).id;
                            database.addShard({idUser:userId,filename:fileName,shardname:fileId,location:'onedrive'});
                        });
                        
                    });
                request.write(data);
                request.end();
                });
        })
    });
     request.write(body);
     request.end(); 
}

async function downloadFromOnedrive(req){
    let fileName=`${decodeURIComponent(req.params.fileName)}.${req.headers['file-extension']}`;
    let userId=req.headers['x-user'];
    let sessionToken=await database.getSessionToken({ cloud: 'od', idUser: userId });
    let shardId=await database.getShard({id:userId,filename:fileName,location:'onedrive'});
    const fs = require('fs');
    console.log("SHARD ID:",shardId);
    let downloadName=`${decodeURIComponent(req.params.fileName)}-od-d.${req.headers['file-extension']}`;
    const writeStream = fs.createWriteStream(`./user_files/${downloadName}`,'binary');
    let options={
        method:'GET',
        hostname: 'graph.microsoft.com',
        path: `/v1.0/me/drive/items/${shardId}/content`,
        headers:{
            'Authorization': `Bearer ${sessionToken}`,
        }
    }
    let data = "";
    let response={};
    const request=https.request(options,function(res){
        let downloadLink=res.headers['location'];
        console.log(res.statusCode);
        console.log("HEADERS:", res.headers);
        let hostname=downloadLink.substr(8).split('/')[0];
        let path=downloadLink.substr(8).substr(downloadLink.substr(8).indexOf('/'));
        console.log("Host:",hostname);
        console.log("Path:",path);
        let downloadOptions={
            method:'GET',
            hostname: hostname,
            path: path
        }
        const downloadrequest=https.request(downloadOptions,function(res){
            res.setEncoding('binary');
            res.on('data',function(d){
                data+=d;
            });
            res.on('end',()=>{
                try{
                    response = JSON.parse(data).error; 
                }catch (e) {
                   writeStream.write(data);
                   writeStream.end();
                }
            });
        });
        downloadrequest.end();
    });
    request.end();
}

/* Get the files of a user for the scope provided (folder provided) */
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

async function downloadFile(req, res){
    let fileName=`${decodeURIComponent(req.params.fileName)}.${req.headers['file-extension']}`;
    let url=req.url;
    console.log("Filename:",fileName);
    let scope=url.substring(0,url.lastIndexOf('/')).split('/').pop();
    console.log("URL:",url);
    if(scope==='index'){
        scope='root';
    }
    let result=await database.checkFileExistence({user_id:req.headers['x-user'],filename:fileName,scope:scope});
    if(result==='OK'){
        res.setHeader('Content-Type', 'application/json');
        const fs = require('fs');
        try{
            let readStream=fs.createReadStream(`./user_files/${fileName}`);
            // let connectedDrives=await cm.getClouds(req.headers['x-user']);
            //     if(connectedDrives.dropbox==='Connected'){
            //         console.log('Descarcam din dropbox');
            //         downloadFromDropbox(req);
            //     }
            //     if(connectedDrives.google==='Connected'){
            //         console.log('Descarcam din google drive');
            //         downloadFromgoogleDrive(req);
            //     }if(connectedDrives.onedrive==='Connected'){
            //         console.log('Descarcam din onedrive');
            //         downloadFromOnedrive(req);
            //     }
            // readStream.pipe(res);
            
        }catch(error){
            res.end(error);
        }
    }
}

module.exports = {
    uploadFile: uploadFile,
    uploadToDropbox: uploadToDropbox,
    uploadToGoogle:uploadToGoogle,
    uploadToOneDrive:uploadToOneDrive,
    downloadFromDropbox:downloadFromDropbox,
    downloadFromGoogle:downloadFromGoogle,
    downloadFromOnedrive:downloadFromOnedrive,
    getUserFiles: getUserFiles,
    downloadFile:downloadFile
}