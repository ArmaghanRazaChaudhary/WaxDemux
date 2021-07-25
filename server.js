const axios = require('axios');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/data";
var count = 0;
var db;

axios.get('https://wax.api.atomicassets.io/atomicassets/v1/accounts?collection_name=armiesxpower&schema_name=s1playables&limit=500&page=1')
.then(async function (response) {
  db = await  MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true});

  for (let i = 0; i < response.data.data.length; i++) {

    //await getAssets(response.data.data[i]);
    await getSum(response.data.data[i].account);
  }
})
.catch(function (error) {
    console.log(error);
});


async function getAssets(element){

  var ceiledAssetNumber = Math.ceil(parseInt(element.assets/1000));
  for(i=1; i <= ceiledAssetNumber+1 ; i++){

    response2 = await axios.get('https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=armiesxpower&schema_name=s1playables&limit=1000&page='+i+'&owner='+(element.account).toString());
    console.log(response2.data.data.length)
    for ( j = 0; j < response2.data.data.length; j++) {
  
        var owner = response2.data.data[j].owner;
        var asset_id = response2.data.data[j].asset_id;
        var power = response2.data.data[j].template.immutable_data['power+'];
        var attack = response2.data.data[j].template.immutable_data['attack+'];
        var defense = response2.data.data[j].template.immutable_data['defense+'];
        var obj = {owner,asset_id,power,attack,defense}
        var dbo = await db.db("data");
        await dbo.collection("assets").update({asset_id:asset_id},obj,upsert=true)
        console.log(owner,": ",count);
        count++;
    }
  }
}

async function getSum(user){

  var dbo = db.db("data");

  var cursor = await dbo.collection("assets").aggregate([
      { $match: { owner: user } },
      { $group: { _id: "$owner", totalPower: { $sum: "$power" },totalAttack: { $sum: "$attack" },totalDefense: { $sum: "$defense" },count: { $sum: 1 } } }
  ]);

  var totalPower = 0
  var totalAttack = 0
  var totalDefense = 0

  var documents = await cursor.toArray();
  console.log(user,": ",documents[0])
  if (documents[0].totalPower)
    totalPower = documents[0].totalPower
  if (documents[0].totalAttack)
    totalAttack = documents[0].totalAttack
  if (documents[0].totalDefense)
    totalDefense = documents[0].totalDefense

  totalAssets = documents[0].count;

  var obj2 = {user,totalPower,totalAttack,totalDefense,totalAssets}

  var userData = await dbo.collection("powers").findOne({user:user})

  if(userData.totalPower != totalPower || userData.totalAttack != totalAttack || userData.totalDefense != totalDefense || userData.totalAssets != totalAssets )
    await dbo.collection("powers").update({user:user},obj2,upsert=true)
}