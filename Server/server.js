var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var app = require('./routes.js');
var cm=require('../Models/CloudManager')
var database=require('../Models/DBHandler')
// initialize router
var router = app.Router();

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
    try{
        let aux=await database.createPoll();
        for(let i=0;i<10;++i){
            let queryResult=await database.cevaQuery(Math.floor(Math.random()*3+1));
            console.log(queryResult)
        }
    }
    catch (error){
        console.log("Hmmmm... ",error)
    }
   // console.log("in router:",aux);
    return res.end('salut');
});

//setup router and routing to local files
app.Use(router);
// folder name inside server to publish to web
app.Use(app.Local('public'));
//connect router as middleware
const server = http.createServer(app.Serve).listen(4200);
