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

async function cevaQuery(givenID){
    console.log(givenID);
    return new Promise((resolve,reject)=>{
        connection.query('SELECT * FROM test WHERE idtest<=?',[givenID], function(error, results, fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                resolve(resObjs);
            }   
        });
    });
}

async function addDropboxToken(object){
    return new Promise((resolve,reject)=>{

        connection.query('SELECT * from dropbox_session_tokens WHERE user_id=?',[object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                console.log("I searched for the user and found:",resObjs);
                if(resObjs.length===0){
                    connection.query('INSERT INTO dropbox_session_tokens (user_id,session_token) VALUES (?,?)',[object.idUser,object.sessionToken],function(error,results, fields){
                        if(error){
                            console.log("Am ceva eroare la insertie",error);
                            reject(error);
                        }else{
                            console.log("I added a token for the user:",results);
                            resolve("Token added successfully");
                        }
                    })
                }else{
                   connection.query('UPDATE dropbox_session_tokens SET session_token=? WHERE user_id=?',[object.sessionToken,object.idUser],function(error,results,fields){
                    if(error){
                        reject(error);
                    }else{
                        console.log("I updated the token for the user:",results);
                        resolve("Token updated successfully");
                    }
                   });
                }
                resolve(resObjs);
                // connection.query('INSERT INTO dropbox_session_tokens (user_id,session_token) VALUES (?, ?)',[object.userID,object.sessionToken],function(error,results,fields{
                //     if(error) {
                //         reject(error);
                // }))
            }   
        });

        // connection.query('INSERT INTO dropbox_session_tokens (',[], function(error, results, fields){
        //     if(error) {
        //         reject(error);
        //     }else{
        //         let resObjs=JSON.parse(JSON.stringify(results));
        //         resolve(resObjs);
        //     }   
        // });
    });
}

module.exports = {
    createPoll: createPoll,
    cevaQuery: cevaQuery,
    addDropboxToken: addDropboxToken
};