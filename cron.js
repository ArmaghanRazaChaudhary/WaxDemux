const axios = require('axios');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
var time = 1627172894367;
//collection_name=armiesxpower&schema_name=s1playables&

setInterval(async function(){
    time = time + 5000;
    response = await axios.get('https://wax.api.atomicassets.io/atomicassets/v1/transfers?collection_name=armiesxpower&schema_name=s1playables&limit=100&page=1&after='+time);
    console.log(response.data);

    if(response.data.data.length > 0){

        for(i = 0; i < response.data.data.length; i++){

            console.log(response.data.data[i].recipient_name);
            var recipient = await dbo.collection("powers").findOne({user:response.data.data[i].recipient_name});

            if(recipient){
                for(j = 0; j < response.data.data[i].assets.length ; j++){
                    console.log(response.data.data[i].assets[j].template.immutable_data['power+']);
                    await dbo.collection("powers").updateOne( {user:response.data.data[i].recipient_name},{ $inc: { totalPower: parseInt(response.data.data[i].assets[j].template.immutable_data['power+']) }});
                }
            }

            console.log(response.data.data[i].sender_name);
            var sender = await dbo.collection("powers").findOne({user:response.data.data[i].sender_name});

            if(sender){
                for(j = 0; j < response.data.data[i].assets.length ; j++){
                    console.log(response.data.data[i].assets[j].template.immutable_data['power+']);
                    await dbo.collection("powers").updateOne( {user:response.data.data[i].sender_name},{ $inc: { totalPower: -1 * parseInt(response.data.data[i].assets[j].template.immutable_data['power+']) }});
                }
            }
        }
       
    }
    else
        console.log("No Transfers in "+time)

},5000)



