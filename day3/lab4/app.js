function validateForm()
{
    var username = document.getElementById("username").value
    var password = document.getElementById("password").value


    if (username!== "" && password !==""){
        if(username.length>=5 && password.length>=8)
            alert("Login Succesful")
        else
        alert("Username and password not match category")
    }
    else
    alert("Please enter both username and password")
}