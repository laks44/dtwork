var http = require('http')
http.createServer(function(req,res){
    res.write('Hello World')
    res.end();
    console.log("Server is running on 8000")
}).listen(8000)