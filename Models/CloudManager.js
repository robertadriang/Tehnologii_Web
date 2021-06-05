let dropbox=require('./DropboxManager');
let google=require('./GoogleDriveManager');
let onedrive=require('./OneDriveManager');
var database=require('../Models/DBHandler');

async function setCloud(request){
    if(request.cloud=='db'){
        /// Dropbox
        // console.log("Token in CM:",await dropbox.createSessionToken(request));
        // console.log("token in CM refreshed:",await dropbox.refreshSesssionToken(request));   //<--- Uncomment these to check the create/refresh oAuth flow. 
        return dropbox.createSessionToken(request);
    }else if(request.cloud=='gd'){
        // Google Drive
        // console.log("Token in CM:",await google.createSessionToken(request));
        // console.log("token in CM refreshed:",await google.refreshSesssionToken(request)); //<--- Uncomment these to check the create/refresh oAuth flow. 
        return await google.createSessionToken(request);
    }else{
        // OneDrive
        // console.log("Token in CM:",await onedrive.createSessionToken(request));
        // console.log("token in CM refreshed:",await onedrive.refreshSesssionToken(request)); //<--- Uncomment these to check the create/refresh oAuth flow. 
        return await onedrive.createSessionToken(request);
    }
}

module.exports = {
    setCloud: setCloud
}