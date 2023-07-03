
const ds = require("entangld");

class Datastore {
    attach() {}
    detach() {}
    transmit() {}
    receive() {}
    set() {}
}

module.exports = JSON.stringify(ds)=="{}" ? Datastore : ds;

