const currentURL=window.location.href;

if(currentURL.indexOf("index")!==-1){
    console.log("home");
    fetch('http://localhost:4200/home/index',{
        method:'GET',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(response=>{
        console.log(response);
    })
}
