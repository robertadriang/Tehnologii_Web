var jwt=require('jsonwebtoken');
function verifyJWT (req, res){
    const token = req.headers.cookie.split(" ")[1].split("=")[1];
    console.log("COOKIES: " + req.headers.cookie)
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