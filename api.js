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