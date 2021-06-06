async function loginRequest()
{
    let id = document.getElementById("id").value;
    let password = document.getElementById("psswd").value;
    var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;     //email address regex filter
    var usernameFilter = /^[a-zA-Z0-9]+([a-zA-Z0-9_]*[a-zA-Z0-9]+)*$/;                       //username regex filter
    if(id == "" || id == null)
        alert("Username field is empty");
    else if (password == "" || password == null)
        alert("Password field is empty");
    else if (!emailFilter.test(id) && !usernameFilter.test(id))
        alert("Invalid username or email adress!")
    else{
        let response = await fetch('http://localhost:4200/login',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                password
            })
        })

        if(response.status == 200)
        {
            
            response = response.text().then(async (token)=> {
                console.log(token);
                let responseGET = await fetch('http://localhost:4200/home/index?validated',{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                })
                
                if(responseGET.status == 200)
                    //  window.location.replace("http://localhost:4200/home/index");
                    alert(token);

    
                
            });
        

        }     

    }

        

}