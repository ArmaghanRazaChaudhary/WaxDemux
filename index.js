
const {MongoClient} = require('mongodb');
const { BaseActionWatcher } = require("demux")
const { NodeosActionReader } = require("demux-eos") // eslint-disable-line
const ObjectActionHandler = require("./ObjectActionHandler")
const handlerVersion = require("./handlerVersions/v1")

const actionHandler = new ObjectActionHandler([handlerVersion])
const actionReader = new NodeosActionReader({
  startAtBlock: 130421054,
  onlyIrreversible: false,
  nodeosEndpoint: "https://wax.eosn.io/"
})


const actionWatcher = new BaseActionWatcher(
  actionReader,
  actionHandler,
  250,
)

actionWatcher.watch()
