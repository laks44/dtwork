function addnumber(){
    console.log("-----------------")
    var numberone = parseInt(document.getElementById('numone').value)
    var numbertwo = parseInt(document.getElementById('numtwo').value)
    var sum = numberone+numbertwo
    var output = `Output is ${sum}`
    document.getElementById('result').innerHTML = `Output is ${sum}`
}