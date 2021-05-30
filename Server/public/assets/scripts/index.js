const APP_KEY = "mi6pgkf1iy9maga";

const currentURL=window.location.href;

if (currentURL.indexOf("code") !== -1) {
    console.log("Am tokenu de la Dropbox sunt creier supersonic");
    const token=currentURL.substring(currentURL.lastIndexOf("code=")+"code=".length);
    console.log(token);
    fetch('http://localhost:4200/config/config_cloud',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'storage-code':token
        }
    }).then(response=>response.text()).then(data=>console.log(data));
} else {
    console.log("Unde-i tokenu nu e tokenu");
}


window.onload = function () {
    document.getElementById("dropbox_connect").onclick = () => {
        console.log("salut");
        window.location.replace(`https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&response_type=code&redirect_uri=${currentURL}`,
            "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=0,width=1920,height=1080");
    }
};