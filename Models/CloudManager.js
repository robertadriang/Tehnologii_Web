let dropbox=require('./DropboxManager');
let google=require('./GoogleDriveManager');
let onedrive=require('./OneDriveManager');
var database=require('../Models/DBHandler');

async function setCloud(request){
    if(request.cloud=='db'){
        ///Dropbox
        /* TODO: REMOVE THIS WE ARE ONLY TESTING THE TOKEN GENERATION BY REFRESH */
       // console.log("token in CM: ",await dropbox.createSessionToken(request));
        //console.log("token in CM refreshed",await dropbox.refreshSesssionToken(request));
        return await dropbox.createSessionToken(request); 
    }else if(request.cloud=='gd'){
        //google drive
        return await google.createSessionToken(request);
        //return await google.refreshSesssionToken(request);
    }else{
        //return await onedrive.createSessionToken(request);
        console.log("ALO ALO");
        console.log("Token in CM:",await onedrive.createSessionToken(request));
        console.log("token in CM refreshed:",await onedrive.refreshSesssionToken(request));
        //onedrive
    }
}

module.exports = {
    setCloud: setCloud
}