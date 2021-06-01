let db=require('./DropboxManager');


async function setCloud(request){
    if(request.cloud=='db'){
        ///Dropbox

        /* TODO: REMOVE THIS WE ARE ONLY TESTING THE TOKEN GENERATION BY REFRESH */
        await db.getToken(request);
        return await db.getTokenByRefresh(request);


        //return db.getToken(request);      
        
    }else if(request.cloud='g'){
        //google drive
    }else{
        //onedrive
    }
}

module.exports = {
    setCloud: setCloud
}