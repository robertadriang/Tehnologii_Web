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

async function getRefreshToken(object){
    return new Promise((resolve,reject)=>{
        connection.query('SELECT refresh_token from dropbox_session_tokens WHERE user_id=?',[object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                resolve(resObjs[0].refresh_token);
            }   
        });
    });
}

/* Dropbox flow allows for sessionTokens that last ~45 minutes. But you can request a refresh token that can be used to generate a new sessionToken without asking for the login again */
async function addBothDropboxTokens(object){
    return new Promise((resolve,reject)=>{
        connection.query('SELECT * from dropbox_session_tokens WHERE user_id=?',[object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    connection.query('INSERT INTO dropbox_session_tokens (user_id,session_token,refresh_token) VALUES (?,?,?)',[object.idUser,object.sessionToken,object['refresh_token']],function(error,results, fields){
                        if(error){
                            console.log("Dropbox Tokens insertion error: ",error);
                            reject(error);
                        }else{
                            console.log("I added BOTH tokens for the user:",results);
                            resolve(resObjs);
                        }
                    });
                }else{
                   connection.query('UPDATE dropbox_session_tokens SET session_token=?, refresh_token=? WHERE user_id=?',[object.sessionToken,object['refresh_token'],object.idUser],function(error,results,fields){
                    if(error){
                        reject(error);
                    }else{
                        console.log("I updated the tokens for the user!");
                        resolve(resObjs);
                    }
                   });
                }
            }   
        });
    });
}

async function addDropboxSessionToken(object){
    return new Promise((resolve,reject)=>{
        connection.query('SELECT * from dropbox_session_tokens WHERE user_id=?',[object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    connection.query('INSERT INTO dropbox_session_tokens (user_id,session_token,refresh_token) VALUES (?,?)',[object.idUser,object.sessionToken],function(error,results, fields){
                        if(error){
                            console.log("Dropbox Token insertion error:",error);
                            reject(error);
                        }else{
                            console.log("I added a token for the user!");
                            resolve(resObjs);
                        }
                    });
                }else{
                   connection.query('UPDATE dropbox_session_tokens SET session_token=? WHERE user_id=?',[object.sessionToken,object.idUser],function(error,results,fields){
                    if(error){
                        reject(error);
                    }else{
                        console.log("I updated the token for the user!");
                        resolve(resObjs);
                    }
                   });
                }
            }   
        });
    });
}

module.exports = {
    createPoll: createPoll,
    addBothDropboxTokens: addBothDropboxTokens,
    addDropboxSessionToken:addDropboxSessionToken,
    getRefreshToken:getRefreshToken
};