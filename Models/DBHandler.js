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

module.exports = {
    createPoll: createPoll,
    cevaQuery: cevaQuery
}