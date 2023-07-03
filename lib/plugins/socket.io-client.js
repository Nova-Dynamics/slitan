
const io = require("socket.io-client");

function IO() {
    this.on = function() {};
    return this;
};

module.exports = JSON.stringify(io)=="{}" ? IO : io;

