const mysql = require('mysql');
var connection;

async function createPoll(){
    return new Promise((resolve,reject)=>{
        connection = mysql.createPool({
          connectionLimit: 3,
          host: 'localhost',
          user: 'root',
          password: 'student',
          database: 'unst'
        });
        resolve(connection);
    })
}

function getTableName(object){
    if(object.cloud==='db'){
        return "dropbox_session_tokens";
    }else if(object.cloud==='od'){
        return "onedrive_session_tokens";
    }else {
        return "google_session_tokens";
    }
}

async function getRefreshToken(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT refresh_token from ?? WHERE user_id=?',[tableName,object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                resolve(resObjs[0].refresh_token);
            }   
        });
    });
}

async function getSessionToken(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT session_token from ?? WHERE user_id=?',[tableName,object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                resolve(resObjs[0].session_token);
            }   
        });
    });
}

async function addBothTokens(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT * from ?? WHERE user_id=?',[tableName,object.idUser], function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    connection.query('INSERT INTO ?? (user_id,session_token,refresh_token) VALUES (?,?,?)',[tableName,object.idUser,object.sessionToken,object['refresh_token']],function(error,results, fields){
                        if(error){
                            console.log("Tokens insertion error: ",error);
                            reject(error);
                        }else{
                            console.log("I added BOTH tokens for the user");
                            resolve("OK");
                        }
                    });
                }else{
                   connection.query('UPDATE ?? SET session_token=?, refresh_token=? WHERE user_id=?',[tableName,object.sessionToken,object['refresh_token'],object.idUser], function(error,results,fields){
                    if(error){
                        reject(error);
                    }else{
                        console.log("I updated the tokens for the user!");
                        resolve("OK");
                    }
                   });
                }
            }   
        });
    });
}

async function addSessionToken(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT * from ?? WHERE user_id=?',[tableName,object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    connection.query('INSERT INTO ?? (user_id,session_token,refresh_token) VALUES (?,?)',[tableName,object.idUser,object.sessionToken],function(error,results, fields){
                        if(error){
                            console.log("Dropbox Token insertion error:",error);
                            reject(error);
                        }else{
                            console.log("I added a token for the user!");
                        }
                    });
                }else{
                   connection.query('UPDATE ?? SET session_token=? WHERE user_id=?',[tableName,object.sessionToken,object.idUser],function(error,results,fields){
                    if(error){
                        reject(error);
                    }else{
                        console.log("I updated the token for the user!");
                    }
                   });
                }
                resolve("OK");
            }   
        });
    });
}

async function isConnected(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT * from ?? WHERE user_id=?',[tableName,object.idUser], function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    resolve("NO");
                }else{
                    resolve("OK");
                }
                
            }   
        });
    });
}

async function deleteBothTokens(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('DELETE FROM ?? WHERE user_id=?',[tableName,object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                resolve("OK");
            }
        })
    })
}

module.exports = {
    createPoll: createPoll,
    getRefreshToken:getRefreshToken,
    getSessionToken:getSessionToken,
    addBothTokens:addBothTokens,
    addSessionToken:addSessionToken,
    isConnected:isConnected,
    deleteBothTokens:deleteBothTokens
};