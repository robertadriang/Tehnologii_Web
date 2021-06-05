const DROPBOX_APP_KEY = "mi6pgkf1iy9maga";
const GOOGLE_APP_KEY = "564941956565-tfkfdegc2folbb34pp1g76votgd0ppek.apps.googleusercontent.com";
const ONEDRIVE_APP_KEY="f796a5b8-6338-4394-86bd-1745e7a3942f";

const currentURL=window.location.href;

if (currentURL.indexOf("code") !== -1) {
    let token=currentURL.substring(currentURL.lastIndexOf("code=")+"code=".length);
    let token_type="";
    if(currentURL.indexOf("google")!==-1){
        token=token.substring(0,token.lastIndexOf("&scope"));
        token_type="gd";
    }else if(currentURL.indexOf("M.R3")!==-1){
        token_type="od";
    }else{
        token_type="db";
    }
    fetch('http://localhost:4200/config/config_cloud',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'storage-code':token,
            'token-type':token_type
        }
    }).then(response=>response.text()).then(data=>console.log(data)).then(window.location='http://localhost:4200/config/config_cloud.html');
} else {
    console.log("Unde-i tokenu nu e tokenu");
}

window.onload = function () {
    document.getElementById("dropbox_connect").onclick = () => {
        console.log("Dropbox");
        window.location.replace(`https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&response_type=code&redirect_uri=${currentURL}&token_access_type=offline`);
    }
    document.getElementById("google_drive_connect").onclick=()=>{
        console.log("Google Drive");
        window.location.replace(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_APP_KEY}&redirect_uri=${currentURL}&scope=https://www.googleapis.com/auth/drive&response_type=code&access_type=offline`);
    }
    document.getElementById("one_drive_connect").onclick=()=>{
        console.log("One Drive");
        window.location.replace(`https://login.live.com/oauth20_authorize.srf?client_id=${ONEDRIVE_APP_KEY}&scope=files.readwrite.all offline_access&response_type=code&redirect_uri=${currentURL}`); /// we will search that the token starts with M.R3_BAY. Need a better solution
    }
};