var database=require('../Models/DBHandler');

async function uploadFile(req){
    return new Promise((resolve,reject)=>{
        let fileName=req.headers['x-filename'];
        console.log("Filename:",fileName);
        const fs=require('fs');
        const writeStream=fs.createWriteStream(`./user_files/${fileName}`);
        req.on('data',chunk=>{
            writeStream.write(chunk);
        });
        req.on('end',async ()=>{
            writeStream.end();
            try{
                let result=await database.uploadFile({user_id:req.headers['x-user'],filename:fileName,scope:req.headers['x-scope']});
                resolve(result);
            }catch(error){
                reject(error);
            }
           
        });
        req.on('error',err=>{
            writeStream.end();
            reject(err);
        })
    });
}

module.exports = {
    uploadFile:uploadFile
}