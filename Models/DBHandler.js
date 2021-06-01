const mysql = require('mysql');
var connection;

async function createPoll(){
    return new Promise((resolve,reject)=>{
        const mysql = require('mysql');
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

async function findUserInDB(userData){
    return new Promise((resolve,reject)=>{
        connection.query('SELECT iduser FROM user WHERE email = ? AND username = ? AND password = ?',[userData.email, userData.username, userData.password], function(error, queryResult, fields){
            if(error){
                console.log("FindUserInDB - Error: ", error);
                reject(error);
            }else{
                
                let result = JSON.parse(JSON.stringify(queryResult));
                resolve(result);
            }
        });
    });
}

async function insertUserInDB(userData){
    return new Promise((resolve,reject)=>{
        connection.query('INSERT INTO user VALUES(NULL,?,?,?)',[userData.email, userData.username, userData.password], function(error, queryResult, fields){
            if(error){
                console.log("insertUserInDB - Error: ", error);
                reject(error);
            }else{
                let result = JSON.parse(JSON.stringify(queryResult));
                resolve(result);
            }
        });
    });
}

module.exports = {
    createPoll: createPoll,
    cevaQuery: cevaQuery,
    findUserInDB: findUserInDB,
    insertUserInDB: insertUserInDB
}