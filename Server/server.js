var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var app = require('./routes.js');
var cm=require('../Models/CloudManager')
var database=require('../Models/DBHandler')
var userManager=require('../Models/UserManager')
var jwt=require('jsonwebtoken')
// initialize router
var router = app.Router();

const ACCES_TOKEN_SECRET = '31384bbbaace98d1a69aced97973ed3c0c958f13a1921ae7a650328ee3e586c66aa934156b5a117a14e0793989b7b4c8e5c4904a1afdea86308678ed5fc17e25';
const REFRESH_TOKEN_SECRET = '6f38b681bc49e8e9b8aa99041a4ef75127d12ebefd67f03730d422355f3d1b6f8b899ea1eaac9603fa5a5bdc776416ed2933d3a4e0412fc94411356e0ec33de2';



//add routes
// http://localhost:4200/test
router.handle('/test', 'get', (req, res) => {
    return res.end('test something');
});
// format for url parameters
// http://localhost:4200/test/23
router.handle('/test/:testId', 'get', (req, res) => {
    return res.end(`test something ${req.params.testId}`);
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


router.handle('/config/config_cloud', 'POST', async (req, res) => {
    let token=req.headers['storage-code'];
    console.log("Token1:",token);
    let aux={cloud:'db',token:token};

    try{
        let sessionToken=await cm.setCloud(aux);
        return res.end(sessionToken);
    }catch (error){
       // console.log("salutmaomor");
        return res.end(JSON.stringify(error));
      
    }
    //else
      //  return res.end(JSON.stringify(sessionToken));
});


router.handle('/home/index', 'get', async (req, res) => { 
///TODO: set status code according to message (error, duplicate key, not found etc.)
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    jwt.verify(token, ACCES_TOKEN_SECRET, (err,user) =>{
        if(err)
            {
                res.statusCode = 403;
                console.log("cruceamati eroare");
            }
        else
            {
                res.statusCode = 200;
                console.log("cruceamati OK");
            }
    })
    res.end();
});

router.handle('/register','post', (req,res)=>{
    console.log("Register request received!");
    res.statusCode = 200;
    ///TODO: set status code according to message (error, duplicate key, not found etc.)

    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', async () => {

        let dataObj = JSON.parse(data);             //data contains the body of the request that came from the client; therefore, we create the object 'dataObj' using JSON.parse();
        let message = await userManager.registerUser(dataObj);
        console.log("Server: ", message);
        res.end(message);
    })
});

router.handle('/login','post', (req,res)=>{
    console.log("Login request received!");
    
    ///TODO: set status code according to message (error, duplicate key, not found etc.)
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
            const foundUsername = message.substring(message.indexOf("\"")+1,message.lastIndexOf("\""));
            const accessToken = jwt.sign(foundUsername, ACCES_TOKEN_SECRET);
            res.end(accessToken);
        }


    })
});

//setup router and routing to local files
app.Use(router);
// folder name inside server to publish to web
app.Use(app.Local('public'));
//connect router as middleware
const server = http.createServer(app.Serve).listen(4200);
