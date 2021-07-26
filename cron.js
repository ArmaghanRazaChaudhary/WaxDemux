const axios = require('axios');
var time = 1627262819033;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/data";
var db;
var dbo;

async function connectMongo(){
    db = await MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true});
    dbo = db.db("data");
}

connectMongo();
setInterval(async function(){
    time = time + 5000;
    response = await axios.get('https://wax.api.atomicassets.io/atomicassets/v1/transfers?collection_name=armiesxpower&schema_name=s1playables&limit=100&page=1&after='+time);

    if(response.data.data.length > 0){
        console.log(response.data.data[0])

        for(i = 0; i < response.data.data.length; i++){

            var sender = await dbo.collection("powers").findOne({user:response.data.data[i].sender_name});
            var recipient = await dbo.collection("powers").findOne({user:response.data.data[i].recipient_name});

            console.log(response.data.data[i].sender_name)

            if(sender){
                console.log("In deduction Module")

                for(j = 0; j < response.data.data[i].assets.length; j++){

                    console.log(response.data.data[i].assets[j].template.immutable_data['power+'])
                    if(response.data.data[i].assets[j].template.immutable_data['power+'])
                        await dbo.collection("powers").updateOne( {user:response.data.data[i].sender_name},{ $inc: { totalPower: -1 * parseInt(response.data.data[i].assets[j].template.immutable_data['power+']) }},upsert=true);

                }
                
                if(recipient){
                    console.log("In Addition Module")

                    for(j = 0; j < response.data.data[i].assets.length; j++){

                        console.log("loop")
                        await updateAssetOwner(response.data.data[i].assets[j].asset_id,response.data.data[i].recipient_name);
                        await dbo.collection("powers").updateOne( {user:response.data.data[i].recipient_name},{ $inc: { totalPower: parseInt(response.data.data[i].assets[j].template.immutable_data['power+']) }},upsert=true);
                    }
                }
                else{
                    console.log("Blend happened")
                    for(j = 0; j < response.data.data[i].assets.length; j++){
                        await deleteAsset(response.data.data[i].assets[j].asset_id);
                    }

                    await insertAssetBlend(response.data.data[i].sender_name);

                }
            }
        }
    }
    else
        console.log("No Transfers in "+time)

},5000)

async function insertAssetBlend(user){

    responseAsset = await axios.get('https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=armiesxpower&schema_name=s1playables&page=1&limit=1&owner='+user);
    //console.log(responseAsset.data.data[0])
    var owner = responseAsset.data.data[0].owner;
    var asset_id = responseAsset.data.data[0].asset_id;
    var power = responseAsset.data.data[0].template.immutable_data['power+'];
    var attack = responseAsset.data.data[0].template.immutable_data['attack+'];
    var defense = responseAsset.data.data[0].template.immutable_data['defense+'];
    var obj = {owner,asset_id,power,attack,defense}
    await dbo.collection("assets").updateOne({asset_id:asset_id},{$set:obj},upsert=true)

    //console.log("Power to increament: ",power)
    //console.log("User to increament: ",responseAsset.data.data[i])

    await dbo.collection("powers").updateOne( {user:user},{ $inc: { totalPower: power }},upsert=true);

}

async function updateAssetOwner(asset_id,newOwner){
    await dbo.collection("assets").updateOne( {asset_id:asset_id},{ $set: { owner: newOwner}},upsert=true);
}

async function deleteAsset(asset_id){
    await dbo.collection("assets").deleteOne( {asset_id:asset_id});
}


