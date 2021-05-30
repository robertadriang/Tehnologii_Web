var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var app = require('./routes.js');
// initialize router
var router = app.Router();
const queryString = require('querystring');

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
    let message=`Am primit tokenul: ${token}`;
    console.log("Token1:",token);

    async function testAsync(){
        await console.log("GetToken Result:",getToken(token));
    }
    testAsync();

    return res.end("Am reusit");
});
//setup router and routing to local files
app.Use(router);
// folder name inside server to publish to web
app.Use(app.Local('public'));
//connect router as middleware
const server = http.createServer(app.Serve).listen(4200);

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function getToken(token){
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
        code: token,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:4200/config/config_cloud.html'    
    });
    let data="";
    var access_token="";

    let request=await https.request(
        options,
        function(resp) {
            resp.on('data', d => data += d);
            resp.on('end', () => {
                    let result=JSON.parse(data);
                    access_token+=result.access_token;
                    console.log("Access_token:",access_token);
                });
      });
    await request.write(body);
    await request.end();
    while(access_token===""){
        await console.log("Aici e access token:",access_token);
        await sleep(100);
    }
    return access_token;
}
