var crypto = require('crypto');
var database=require('../Models/DBHandler')

async function registerUser(userData)
{
    var message = '';
    var passwordPlain = userData.password;       //we extract the plain text password that came from the client
    userData.password = crypto.createHash("sha256").update(passwordPlain).digest("hex");     //we update the password field in the 'dataObj' with an encrypted value;
    console.log(userData);
    try{
        let aux = await database.createPoll();
        let foundUsers = await database.findUserInDB(userData);
        if(foundUsers.length == 0){
            let insertResult = await database.insertUserInDB(userData);
            console.log(insertResult);
            message = 'User inserted succesfuly';
        }
        else{
            message = 'User already in DB!';
            console.log("User already in DB!");
        }
    }
    catch(error){
        if(error.sqlMessage.includes("Duplicate entry"))
        {
            if(error.sqlMessage.includes('email')){
                message="Email \"" + userData.email + "\" is already taken!";
            }
            else if(error.sqlMessage.includes('username')){
                message="Username \"" + userData.username + "\" is already taken!";
            }
        }
    }
    return(message);
}

module.exports = {
    registerUser: registerUser,
}