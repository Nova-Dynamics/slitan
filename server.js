const server=require("http").createServer();
const express=require('express');
const app = express();
const morgan=require('morgan');
const log = require("bunyan").createLogger({name:"dax-diagnostics"});
const nconf = require('nconf');
const stream=require('stream');
const body_parser = require("body-parser");
const cookie_parser = require("cookie-parser");

const SocketIOServer=require('./lib/SocketIOServer');


// Read the config, exit on error
nconf.argv().file({ file: 'config.json' });

if (!nconf.get('log-level')) {
  console.log("Invalid config (log-level) - please make sure config.json exists and is correct. Exiting...");
  process.exit(1);
}
log.level(nconf.get('log-level'));

// A stream to pipe morgan (http logging) to bunyan
let info_log_stream = new stream.Writable()
info_log_stream._write=(chunk, encoding, done) => {

    log.info(chunk.toString().replace(/^[\r\n]+|[\r\n]+$/g,""));
    done();
};


// Set up webservice
server.on("request", app);
app
    .use(cookie_parser())
    .use(body_parser.urlencoded({extended: false}))     // Middleware for POST body parsing (use x-www-form-urlencoded). We would like to use this on a per-router basis, but it inhibits our ability to check body auth (below)
    // .use(Auth.meddle)   // Check auth
	.use(morgan(':remote-addr - ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', { "stream" : info_log_stream }))   // Morgan HTTP logging
	.use("/",express.static("webapp/public")); // serve index.html on `GET /`


// check config for hosting parameters
if (!nconf.get('crew-server')) {
  console.log("Invalid config (crew-server) - please make sure config.json exists and is correct. Exiting...");
  process.exit(1);
}

// Set up socket.io server
var io_server = new SocketIOServer(server, log, nconf.get('crew-server'))


// check config for hosting parameters
if (!nconf.get('server-params')) {
  console.log("Invalid config (server-params) - please make sure config.json exists and is correct. Exiting...");
  process.exit(1);
}

// Fire up the bass cannon
server.listen.apply(server, [nconf.get('server-params')['port'],nconf.get('server-params')['host']]);
log.info(`Hosting webserver on http://${nconf.get('server-params')['host']}:${nconf.get('server-params')['port']}`)
