var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var app = require('./routes.js');
var cm=require('../Models/CloudManager')
var database=require('../Models/DBHandler')

var fileHandler=require('../Models/FileManager')

var userManager=require('../Models/UserManager')
var jwt=require('jsonwebtoken');
const { restart } = require('nodemon');
require('dotenv').config();
// initialize router
var router = app.Router();

// const ACCES_TOKEN_SECRET = '31384bbbaace98d1a69aced97973ed3c0c958f13a1921ae7a650328ee3e586c66aa934156b5a117a14e0793989b7b4c8e5c4904a1afdea86308678ed5fc17e25';
// const REFRESH_TOKEN_SECRET = '6f38b681bc49e8e9b8aa99041a4ef75127d12ebefd67f03730d422355f3d1b6f8b899ea1eaac9603fa5a5bdc776416ed2933d3a4e0412fc94411356e0ec33de2';



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
    try{
        let connectedDrives=await cm.getClouds(1);/// TODO: Replace 1 with actual user ID or change it to send the jwt
        console.log("Am trimis la client:",connectedDrives);
        return res.end(JSON.stringify(connectedDrives)); 
    }catch (error){
     return res.end(JSON.stringify(error));     
     }
 });

 /*Connect a drive to your account*/

router.handle('/config/config_cloud', 'POST', async (req, res) => {
    let token=req.headers['storage-code'];
    let token_type=req.headers['token-type'];
    console.log("Access token:",token,"for the drive:",token_type);
    let object={cloud: token_type,token:token,idUser:1};/// TODO: Replace 1 with actual user ID or change it to send the jwt
    try{
        let sessionToken=await cm.setCloud(object);
        res.end(sessionToken);
        console.log("Am returnat la client:",sessionToken,"pentru drive-ul:",token_type);
        return;
    }catch (error){
        return res.end(JSON.stringify(error));     
    }
});


/*Delete a drive from your account */
router.handle('/config/config_cloud', 'DELETE', async (req, res) => {
    let token_type=req.headers['token-type'];
    let object={cloud: token_type,idUser:1};/// TODO: Replace 1 with actual user ID or change it to send the jwt
    try{
        let dboperation=await cm.deleteCloud(object);
        return res.end(dboperation);
    }catch (error){
        return res.end(JSON.stringify(error));     
    }
});

function verifyJWT (req, res){
    const token = req.headers.cookie.split(" ")[1].split("=")[1];
    return new Promise((resolve, reject) =>{
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) =>{
            if(err){
                reject();
            }
            else{
                resolve(user);
            }
        })
    })
} 

function authorize (req,res){
    let user = null;

    return new Promise((resolve, reject)=>{
        try{
            verifyJWT(req,res).then((user)=>resolve(user))
        }
        catch{
            res.statusCode = 302;
            reject();
        }
    })
}


/*Create the connection pool*/   /// TODO: Move this to a better place? 
router.handle('/home/index', 'get', async (req, res) => { 
///TODO: set status code according to message (error, duplicate key, not found etc.)
    try{

        let aux=await database.createPoll();
        console.log("Connection pool created!");

        let user = await authorize(req,res);

    }
    catch{
        console.log("AUTH ERROR:" + res.statusCode)
        res.end();
    }

    return res.end('Connection pool created!');
});

/*Upload a file*/
router.handle('/home/index/upload', 'POST', async (req, res) => { 
    try{
        await fileHandler.uploadFile(req);
        await fileHandler.uploadToDropbox(req);
        await fileHandler.uploadToGoogle(req);
        await fileHandler.uploadToOneDrive(req);
        let result=await fileHandler.getUserFiles(req);       
        res.statusCode=200;
        res.end(JSON.stringify(result));
    }
    catch (error){
        console.log("Hmmmm... ",error);
        res.statusCode=400;
        return res.end('fail');
    }
});

/*Get all the files for a user and a scope */
router.handle('/home/index/all', 'GET', async (req, res) => { 
    try{
        let result=await fileHandler.getUserFiles(req)
        res.statusCode=200;
        res.end(JSON.stringify(result));
    }
    catch (error){
        console.log("Hmmmm... ",error);
        res.statusCode=400;
        return res.end('fail');
    }
});

router.handle('/home/index/:fileName', 'GET', async (req, res) => {
    let fileName=`${req.params.fileName}.${req.headers['file-extension']}`;
    console.log(`Am primit request de download pentru: ${fileName}`);
    await fileHandler.downloadFromDropbox(req);
    await fileHandler.downloadFromGoogle(req);
    await fileHandler.downloadFromOnedrive(req);
    await fileHandler.downloadFile(req,res);

    // console.log("AUTH NO ERROR:" + res.statusCode)
    // res.end();

});

router.handle('/register','post', (req,res)=>{
    console.log("Register request received!");
    
    ///TODO: set status code according to message (error, duplicate key, not found etc.)

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
            ///TODO: need to find a way to save JWT on client side;
            res.setHeader('Set-Cookie', `accessToken=${accessToken}; HttpOnly`);
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
