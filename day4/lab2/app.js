// function welcomeMsg(){
//     let confirmi = false
//     while(!confirmi)
//     {
//     let useri = prompt("Enter your name: ")
//     console.log(`User name is ${useri}`)

//     confirmi = confirm(`Is your name ${useri}`)
//     console.log(confirmi)
//     if(!confirmi)
//         alert("Try again")
//     else{
//     alert(`Welcome ${useri}`)
//     break
//     }
//     }
// }

// welcomeMsg()

function addnum(){
    var useri = prompt("Enter num1: ")
    var usero = prompt("Enter num2: ")
    var sum = parseInt(useri)+parseInt(usero)
    alert(`Welcome ${sum}`)
}

welcomeMsg()