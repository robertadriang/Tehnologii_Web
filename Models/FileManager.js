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
            console.log("Am scris fisierul");
            let size=0;
            let extension=fileName.split('.').pop();
            try{
                // stats=fs.stat(`./user_files/${fileName}`,async (err,stats)=>{
                //         if(err){
                //             console.log(err)
                //         }else{
                //             console.log(stats)
                //         }
                // });
                // console.log("stats:",stats);
                ///TODO: solve the size not being
                let result=await database.uploadFile({user_id:req.headers['x-user'],filename:fileName,scope:req.headers['x-scope'],size:size,extension:extension});
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

async function getUserFiles(req){
    return new Promise(async (resolve, reject) =>{
        try{
            let result=await database.getUserFiles({user_id:req.headers['x-user'],scope:req.headers['x-scope']});
            resolve(result);
        }catch(err){
            reject(err);
        }
    });
}

module.exports = {
    uploadFile:uploadFile,
    getUserFiles:getUserFiles
}