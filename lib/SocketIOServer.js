const IO = require('socket.io')
const ATCPForwarder=require('./ATCPForwarder');

class SocketIOServer {
  constructor(http_server, log, atcp_config) {
    this.io = IO(http_server);
    this._log = log;
    this.atcp_config = atcp_config;

    // Register server events
    this.io.on('connection', (ws_client)=>{ this.on_connection(ws_client); });
  }

  on_connection(ws_client) {
    ATCPForwarder.from_io_connection(ws_client, this.atcp_config, this._log);
    this.log('New Connection');
  }

  /**
   * Wrapper for Bunyan to namespace log
   *
   * @param {String} string - the string to be logged
   * @param {Sting|Undefined} level - the bunyan log level (default is `info`)
   */
  log(string,level) {
    this._log[level?level:'info'](`WS Server - ${string}`)
  }
}


module.exports = exports = SocketIOServer;
