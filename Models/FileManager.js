
async function uploadFile(req){
    return new Promise((resolve,reject)=>{
        let fileName=req.headers['x-filename'];
        console.log("Filename:",fileName);
        const fs=require('fs');
        const writeStream=fs.createWriteStream(`./user_files/${fileName}`);
        req.on('data',chunk=>{
            writeStream.write(chunk);
        });
        req.on('end',()=>{
            writeStream.end();
            resolve(true);
        });
        req.on('error',err=>{
            writeStream.end();
            console.log(err);
            resolve(false);
        })
    });
}

module.exports = {
    uploadFile:uploadFile
}