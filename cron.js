
const io = require("socket.io-client");
const socket = io("https://wax.api.atomicassets.io/atomicassets/v1/transfers");

socket.on('event', (data) => {

    console.log(data)
});
