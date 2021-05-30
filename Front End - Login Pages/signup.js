async function registerUser(){
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("psswd").value;
    const passwordConfirm = document.getElementById("psswd-confirm").value;
    var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;     //email address regex filter
    var usernameFilter = /^[a-zA-Z0-9]+([a-zA-Z0-9_]*[a-zA-Z0-9]+)*$/;     //username regex filter

    if (email == "" || email == null)
        alert("Email address is empty!");
    else if(username == "" || username == null)
        alert("Username is empty!");
    else if (password == "" || password == null)
        alert("Password address is empty!");
    else if (passwordConfirm == "" || passwordConfirm == null)
        alert("Please confirm your password!");
    else if (!emailFilter.test(email))
        alert("Invalid email address!");
    else if (!usernameFilter.test(username))
        alert("Invalid username. A valid username may contain: \n - lower-case or upper-case letters, \n - digits, \n - \'\_\' but not at the beginning or at the end of the username.")

    

        const result = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                username,
                password,
                passwordConfirm
            })
        }).then((res) => res.json())

    console.log(result);
}