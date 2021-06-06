const currentURL=window.location.href;

if(currentURL.indexOf("index")!==-1){
    console.log("home");
    fetch('http://localhost:4200/home/index',{
        method:'GET',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(response=>response.text()).then(data=>console.log(data));
}


window.onload = function () {
    var fileupload = document.getElementById("FileUpload");
    var filePath = document.getElementById("spanFilePath");
    var image = document.getElementById("imgFileUpload");
    image.onclick = function () {
        fileupload.click();
    };
    fileupload.onchange = async function () {
        let formData=new FormData();
        //formData.append("file",fileupload.files[0]);
        var fileName = fileupload.value.split('\\')[fileupload.value.split('\\').length - 1];
        filePath.innerHTML = "<b>Selected File: </b>" + fileName;
        console.log(fileName);
        let response=await fetch('http://localhost:4200/home/index/upload',{
            method:"POST",
            headers:{
                'x-filename':fileName,
                'x-user':1,
                'x-scope':'root'
            },
            body:fileupload.files[0]
        });
        console.log(response.status);
        if(response.status===200){
            alert('The file has been uploaded successfully.');
        }else{
            alert('The file could not be uploaded. Probably duplicate?');
        }  
        this.value=null;
    };
};