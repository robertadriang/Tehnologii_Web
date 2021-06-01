const queryString = require('querystring');
var https = require('https');
var database=require('../Models/DBHandler');

async function getToken(object){
    let options={
        method: 'POST',
        hostname:"api.dropboxapi.com",
        path:"/oauth2/token",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
            'Authorization': 'Basic bWk2cGdrZjFpeTltYWdhOmRqd2M1bG15dzZ5aHFmNQ=='
        }
    };
    let body=queryString.stringify({
        code: object.token,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:4200/config/config_cloud.html'    
    });
    let data="";
    var access_token="";

    return new Promise((resolve,reject)=>{
        request=https.request(
            options,
             function(resp) {
                resp.on('data', d => data += d);
                resp.on('end',async () => {
                        let result=JSON.parse(data);
                        access_token+=result.access_token;
            
                        if(this.res.statusCode!==200){                           
                            reject(result);
                        }else{
                            let addTokenResult=await database.addDropboxToken({idUser:object.idUser,sessionToken:access_token});
                            console.log(addTokenResult);
                            resolve(access_token);
                        }
                    });
                resp.on('error',()=>{
                    reject("Something is not right");
                })
          });
           request.write(body);
           request.end();
    }); 
}


module.exports = {
    getToken: getToken
}

