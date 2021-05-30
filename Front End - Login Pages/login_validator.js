async function loginFunction()
{
    let username = document.getElementById("id").value;
    let password = document.getElementById("psswd").value;
    var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;     //email address regex filter
    var usernameFilter = /^[a-zA-Z0-9]+[a-zA-Z0-9_]+$/;     //username regex filter
    if(username == "" || username == null)
        alert("Username field is empty");
    else if (password == "" || password == null)
        alert("Password field is empty");
    else if (!emailFilter.test(username) && !usernameFilter.test(username))
        alert("Invalid username or email adress!")
        

}