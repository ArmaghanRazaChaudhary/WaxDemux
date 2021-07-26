var express = require("express");
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/data";

app.get('/getData', async function (req, res) {

    db = await  MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true});
    var dbo = await db.db("data");
    var response = await dbo.collection("powers").find().sort({ totalPower: -1 }).toArray();
    res.send(response);
})

app.listen(3000, () => {
 console.log("Server running on port 3000");
});


/*
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);






openssl genrsa -out privatekey.pem 1024 
openssl req -new -key privatekey.pem -out certrequest.csr 
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
*/