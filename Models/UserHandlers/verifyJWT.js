var jwt=require('jsonwebtoken');
function verifyJWT (req, res){
    const start = req.headers.cookie.indexOf("accessToken");
    const end = req.headers.cookie.length+1;
    const token = req.headers.cookie.substring(start,end).split("=")[1];
    console.log("Acces Token: " + token)
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
            reject();
        }
    })
}

module.exports = {
    authorize: authorize
}