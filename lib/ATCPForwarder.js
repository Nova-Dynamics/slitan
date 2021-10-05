const ATCPClient = require("./atcp-client");


/**
 * Object to normalized the interface between client socket.io connections and
 *  the ATCPClient socket used to communicate with the crew-server
 */
class ATCPForwarder {

  /**
   * Constructor
   *
   * @param {Socket} io_socket - a (connected) Socket.io client socket connection
   * @param {ATCPClient} atcp_socket - a (connected) ATCPClient object
   * @param {Logger|Undefined} log - the bunyan logger instance
   * @param {String|Undefined} id - an id for the ATCPClient
   * @static
   */
  constructor(io_socket, atcp_socket, log, id) {
    this.io = io_socket;
    this.atcp = atcp_socket;
    this.id = id ? id : 'Unauth`d';
    this._log = log ? log : {info : console.log};
    this.subscribes = {};

    this.attach_event_handlers();

    this.atcp_ready();

    this.atcp.on("reload_bots", () => this.reload_bots())
  }

  /**
   * Construct an ATCPForwarder from a socket.io client and atcp configuration
   *
   * @param {Socket} io_socket - a Socket.io client socket connection
   * @param {Object} atcp_config - The configuration object for a new ATCPClient object
   * @param {Logger|Undefined} log - the bunyan logger instance
   * @static
   */
  static async from_io_connection(io_socket, atcp_config, log) {
    // TODO : catch errors and pass them along . . . .
    let atcp_socket = new ATCPClient(atcp_config);
    await atcp_socket.connect();

    return new this(io_socket, atcp_socket, log)
  }

  /**
   * Wrapper for Bunyan to namespace log
   *
   * @param {String} string - the string to be logged
   * @param {Sting|Undefined} level - the bunyan log level (default is `info`)
   */
  log(string,level) {
    this._log[level?level:'info'](`WS@${this.id} - ${string}`)
  }


  // ----------------------
  //    Event Emits
  // ----------------------
  /**
   * Log a string in the client's browser console
   *
   * @param {String} string - the string (or serializable object) to log
   */
  log_on_client(string) {
    this.io.emit('log',string)
  }

  /**
   * Tell client that the ATCPClient is connected
   */
  atcp_ready() {
    this.io.emit('atcp_ready')
    this.log('ATCP socket ready')
  }

  /**
   * Forward ATCPClient subscribe data to client browswer
   *
   * @param {String} path - the datastore path the subscribed data originates from
   * @param {Object} data - the json data object
   */
  subscribe_update(path,data) {
    this.io.emit('subscribe_update',path,data)
  }

  reload_bots() {
    this.io.emit('reload_bots')
  }



  // ----------------------
  //    Event Responses
  // ----------------------
  /**
   * Attach all the event handlers which the client can emit to
   */
  attach_event_handlers() {


    this.io.on('disconnect', () => { this.on_disconnect(); });

    this.io.on('authenticate', (username, password_hash, cb) => { this.on_authenticate(username, password_hash, cb); });

    this.io.on('subscribe_path', (path, cb) => { this.on_atcp_method('subscribe_path', cb, path, (_path, data) => { this.subscribe_update(_path,data) }); });
    this.io.on('unsubscribe_path', (path, cb) => { this.on_atcp_method('unsubscribe_path', cb, path); });
    this.io.on('get', (path, params, cb) => { this.on_atcp_method('get', cb, path, params); console.log(path,params);});
    this.io.on('send_command', (uuid, command_string, cb) => { this.on_atcp_method('send_command', cb, uuid, command_string); });

  }

  /**
   * Handle client disconnect
   */
  on_disconnect() {
    this.log('Disconnected, killing atcp socket');
    // FIXME: allow for reconnections within a few seconds?
    
    // Check if the atcp server has already killed the
    // socket, becuase of a server-side reason (like
    // a bot ungracefully suddenly disconnecting)
    if ( this.atcp.client._socket === null ) return;

    // Otherwise, the disconnect is client-initiated, so
    // run a disconnect sequence
    this.atcp.client.disconnect();
  }

  /**
   * Handle Client authentication request
   *
   * @param {String} username - the client's username
   * @param {String} password_hash - the sha256 hex encoded hash of the password
   * @param {Function} cb - callback function used by clients to clear timeouts
   */
  async on_authenticate(username, password_hash, cb) {
    // Check me, does ATCP error on bad logins?
    try {
      await this.atcp.authenticate(username, password_hash)
    } catch (e) {
      cb(false);
      return;
    }
    // Add auth`d username for logging
    let id = username.match(/([^@]*)[@]/)
    this.id = id ? id[1] : username
    this.log("Authenticated")
    cb(true);
  }

  /**
   * Forward client request to ATCPClient to crew-server
   *
   * @param {String} method - the name of the ATCPClient method which should be called
   * @param {Function} cb - callback function used by clients to clear timeouts
   * @param params - any other ordered parameters which the ATCPClient method will require
   */
  async on_atcp_method(method,cb,...params) {
    try {
      cb(await this.atcp[method](...params))
    } catch (e) {
      cb(e);
    }
    // Log the result
    this.log(`${method} ${JSON.stringify(params)}`)
  }
};


module.exports = exports = ATCPForwarder;
