let db=require('./DropboxManager');


async function setCloud(request){
    if(request.cloud=='db'){
        ///Dropbox
            return db.getToken(request.token);      
        
    }else if(request.cloud='g'){
        //google drive
    }else{
        //onedrive
    }
}

module.exports = {
    setCloud: setCloud
}