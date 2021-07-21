var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";





function updateTransferData(state, payload, blockInfo, context) {
  console.log(payload)

  state.asset_ids = payload.data.asset_ids;
  state.collection_name = payload.data.collection_name;
  state.to = payload.data.to;
  state.from = payload.data.from;
  state.totalTransfers += 1
  context.stateCopy = JSON.parse(JSON.stringify(state)) // Deep copy state to de-reference
}

const updaters = [
  {
    actionType: "atomicassets::logtransfer",
    apply: updateTransferData,
  },
]


function logUpdate(payload, blockInfo, context) {
  console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2))

  if(context.stateCopy.collection_name == 's1playables'){

    MongoClient.connect(url, function(err, db) {

      if (err) throw err;

      var dbo = db.db("DemuxData");

      dbo.collection("transfers").insertOne(context.stateCopy, function(err, res) {
        if (err) throw err;
        console.log("DemuxData updated");
        db.close();
      });
    });

  }
}

const effects = [
  {
    actionType: "atomicassets::logtransfer",
    run: logUpdate,
  },
]


const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
}

module.exports = handlerVersion
