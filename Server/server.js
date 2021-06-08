var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var app = require('./routes.js');
var cm=require('../Models/CloudManager')
var verifyJWT=require('./public/assets/scripts/verifyJWT')
var fileHandler=require('../Models/FileManager')
var databaseConnection = require('./init')
var userManager=require('../Models/UserManager')
var jwt=require('jsonwebtoken');
const { restart, reset } = require('nodemon');
require('dotenv').config();
// initialize router
var router = app.Router();

//initialize database connection
databaseConnection.init();  

//add routes
// http://localhost:4200/test
router.handle('/test', 'get', (req, res) => {
    return res.end('test something');
});
router.handle('/test', 'POST', (req, res) => {
    var postData = '';
    req.on('data', (chunk) => {
        postData += chunk;
    });
    req.on('data', () => {
        var JSONdata = JSON.parse(postData);
        console.log(JSONdata);
        return res.end('test something' + JSON.stringify(JSONdata));
    });
});
router.handle('/test', 'get', (req, res) => {
    return res.end('test something');
});
router.handle('/test', 'POST', (req, res) => {
    var postData = '';
    req.on('data', (chunk) => {
        postData += chunk;
    });
    req.on('data', () => {
        var JSONdata = JSON.parse(postData);
        console.log(JSONdata);
        return res.end('test something' + JSON.stringify(JSONdata));
    });
});
// format for url parameters
// http://localhost:4200/test/23
router.handle('/test/:testId', 'get', (req, res) => {
    return res.end(`test something ${req.params.testId}`);
});
router.handle('/test/:testId', 'post', (req, res) => {
    var postData = '';
    req.on('data', (chunk) => {
        postData += chunk;
    });
    req.on('data', () => {
        var JSONdata = JSON.parse(postData);
        console.log(JSONdata);
        return res.end(req.params.testId + 'test something' + JSON.stringify(JSONdata));
    });
});
// format for querystring
// http://localhost:4200/test?q=100&a=1000
router.handle('/test/query', 'get', (req, res) => {
    return res.end(`test something ${JSON.stringify(req.query)}`);
});

router.handle('/', 'get', (req, res) => {
    res.statusCode = 302;
    res.setHeader('Location', '/home/index.html');
    res.end();
});


/*Request connected drives*/
router.handle('/config/config_cloud', 'GET', async (req, res) => {
    console.log("User-ul a cerut setarile pentru drive-uri");
    let isOk = true;
    let user = await verifyJWT.authorize(req,res).catch(e=>{
        res.statusCode = 302;
        isOk = false;
        return res.end('http://localhost:4200/login/login.html');
    });
    if(isOk)
    {
        try{
            res.statusCode = 200;
            let connectedDrives=await cm.getClouds(user.id);
            console.log("Am trimis la client:",connectedDrives);
            return res.end(JSON.stringify(connectedDrives)); 
        }catch (error){
            return res.end(JSON.stringify(error));     
        }
    }

 });

 /*Connect a drive to your account*/
router.handle('/config/config_cloud', 'POST', async (req, res) => {
    let isOk = true;
    user = await verifyJWT.authorize(req,res).catch(e=>{
        res.statusCode = 302;
        isOk = false;
        return res.end('http://localhost:4200/login/login.html');
    });  
    if(isOk)
    {
        
        let token=req.headers['storage-code'];
        let token_type=req.headers['token-type'];
        console.log("Access token:",token,"for the drive:",token_type);                                                
        req.headers['x-user'] = user.id;                     
        let object={cloud: token_type,token:token,idUser:user.id};
        try{
            
            let sessionToken=await cm.setCloud(object);
            res.statusCode = 200;
            res.end(sessionToken);
            console.log("Am returnat la client:",sessionToken,"pentru drive-ul:",token_type);
            return;
        }catch (error){
            return res.end(JSON.stringify(error));     
        }
    }

});

/*Delete a drive from your account */
router.handle('/config/config_cloud', 'DELETE', async (req, res) => {

    let isOk = true;

    let token_type=req.headers['token-type'];
    let user = '';
    
    user = await verifyJWT.authorize(req,res).catch(e=>{
        isOk = false;
        res.statusCode = 302;
        return res.end();
    });      ///AUTORIZAM TOKENU 

    if(isOk)
    {
        req.headers['x-user'] = user.id;                    ///PUNEM ID-UL EXTRAS DIN TOKEN IN HEADER
    
        let object={cloud: token_type,idUser:user.id};
        try{
            let dboperation=await cm.deleteCloud(object);
            return res.end(dboperation);
        }catch (error){
            return res.end(JSON.stringify(error));     
        }
    }


});


/*Upload a file*/
router.handle('/home/index/upload', 'POST', async (req, res) => { 
    let isOk = true;
    let user = await verifyJWT.authorize(req,res).catch(e=>{
        res.statusCode = 302;
        isOk = false;
        return res.end('http://localhost:4200/login/login.html');
    });                                                       ///AUTORIZAM TOKENU 
    if(isOk){
        req.headers['x-user'] = user.id;                    ///PUNEM ID-UL EXTRAS DIN TOKEN IN HEADER
        try{
            
            ///TODO: TRATEAZA CAZURILE IN CARE verifyJWT.authorize DA EROARE;
            await fileHandler.uploadFile(req);
            let result=await fileHandler.getUserFiles(req);       
            res.statusCode=200;
            res.end(JSON.stringify(result));
        }
        catch (error){
            console.log("Hmmmm... ",error);
            res.statusCode=400;
            return res.end('fail');
        }
    }
});

/*Get all the files for a user and a scope */
router.handle('/home/index/all', 'GET', async (req, res) => { 
    let isOk = true;
    let user = await verifyJWT.authorize(req,res).catch(e=>{
        res.statusCode = 302;
        isOk = false;
        return res.end('http://localhost:4200/login/login.html');
    });                                                 ///AUTORIZAM TOKENU 
    if(isOk){
        req.headers['x-user'] = user.id;                    ///PUNEM ID-UL EXTRAS DIN TOKEN IN HEADER
        try{
            let result=await fileHandler.getUserFiles(req)
            res.statusCode=200;
            res.end(JSON.stringify(result));
        }
        catch (error){
            console.log("Hmmmm... ",error);
            return res.end('fail');
        }
    }

});

/*Get a specific file to download it*/
router.handle('/home/index/:fileName', 'GET', async (req, res) => {

    let isOk = true;
    let user = await verifyJWT.authorize(req,res).catch(e=>{
        res.statusCode = 302;
        isOk = false;
        return res.end('http://localhost:4200/login/login.html');
    });                                                   ///AUTORIZAM TOKENU 
    if(isOk)
    {
        res.statusCode = 200;
         req.headers['x-user'] = user.id;                    ///PUNEM ID-UL EXTRAS DIN TOKEN IN HEADER
        let fileName=`${req.params.fileName}.${req.headers['file-extension']}`;
        console.log(`Am primit request de download pentru: ${fileName}`);
        await fileHandler.downloadFile(req,res);
    }
});

router.handle('/register','post', (req,res)=>{
    console.log("Register request received!");
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', async () => {

        let dataObj = JSON.parse(data);             //data contains the body of the request that came from the client; therefore, we create the object 'dataObj' using JSON.parse();
        let message = await userManager.registerUser(dataObj);
        console.log("Server: ", message);
        if(message.includes('successfuly'))
            res.statusCode = 200;
        else if (message.includes('already in DB') || message.includes('already taken'))
            res.statusCode = 409;
        res.end(message);
    })
});

router.handle('/login','post', (req,res)=>{
    console.log("Login request received!");
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', async () => {

        let dataObj = JSON.parse(data);             //data contains the body of the request that came from the client; therefore, we create the object 'dataObj' using JSON.parse();
        let message = await userManager.loginUser(dataObj);
        console.log("Server: ", message);
        if(message.includes("successful")){
            res.statusCode = 200;
            const username_id = message.substring(message.indexOf("\"")+1,message.lastIndexOf("\""));
            const foundUsername = username_id.split("-")[0];
            const foundUserId = username_id.split("-")[1];
            var user = new Object();
            user.id = foundUserId;
            user.username = foundUsername;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            
            res.setHeader('Set-Cookie', `accessToken=${accessToken}; HttpOnly`);        //we save the jwt in a HttpOnly cookie
            res.end(accessToken);
        }
        else if(message.includes("not found")){
            res.statusCode = 404;
            res.end(message);
        }
        else if(message.includes("Incorrect"))
        {
            res.statusCode = 403;
            res.end(message);
        }


    })

});


//setup router and routing to local files
app.Use(router);
// folder name inside server to publish to web
app.Use(app.Local('public'));
//connect router as middleware
const server = http.createServer(app.Serve).listen(4200);
