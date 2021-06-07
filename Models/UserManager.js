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
            message = 'User inserted successfuly';
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

async function loginUser(userData)
{
    var message = '';
    var passwordPlain = userData.password;
    userData.password = crypto.createHash("sha256").update(passwordPlain).digest("hex");
    try{
        let aux = await database.createPoll();
        let foundUsers = await database.findUserInDBLogin(userData);
        if(foundUsers.length == 1){
            const foundIdUser = foundUsers[0].iduser;
            const foundUsername = foundUsers[0].username;
            const foundPassword = foundUsers[0].password;
            if(userData.password == foundPassword) 
                message = 'Login successful. Welcome \"' + foundUsername + '-' + foundIdUser + '\"!';
            else
                message = 'Incorrect password...'
        }
        else if(foundUsers.length == 0){
            message = 'User \"' + userData.id + '\" not found! You should signup first.' 
        }
    }
    catch(error){
        message = 'loginUser Error: ' + error;
    }
    return(message);
}

module.exports = {
    registerUser: registerUser,
    loginUser: loginUser
}