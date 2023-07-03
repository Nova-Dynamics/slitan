#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const { Logger } = require("yalls");
const BuildConfiguration = require("./BuildConfiguration.js");

let log;

//Set up logging to color the message as the log type
let log_cb = (level, string) => console.log([string.split("|")[0], log.f(string.split("|")[1], {color: log.type_to_color(level)})].join("|"))

// Create a logger
log = Logger.callback(log_cb, "", { format:"[:ISO] | :STRING" });

const config_fp = path.resolve(process.argv[2] || "slitan.config.js");
if (!fs.existsSync(config_fp)) {
    log.error(`Error: Configuration file '${config_fp}' does not exist.`);
    process.exit(1);
}

const config = BuildConfiguration.load(config_fp);
try {
    config.check_validity();
} catch(e) {
    log.error("There was an error with your configuration:");
    log.error(e);
    process.exit(1);
}

const entrypoint_path = path.resolve(config.entrypoint);
const output_path = path.resolve(config.output_folder);

let building = false;

// Call rebuild on the project
function rebuild(reason)
{
    log.info("Change detected");
    log.debug(reason);

    if (building)
        return log.info(`Ignoring: Build in progress`);
    
    building = true;

    log.info("Starting build... ");

    const command = `npx slitan-build`;

    exec(command, (error, stdout, stderr) => {

      if (stdout) stdout.replace(/\r/g,"").split("\n").forEach(l => { if (l) log.info(l); });
      if (stderr) stdout.replace(/\r/g,"").split("\n").forEach(l => { if (l) log.error(l); });
      
      if (error) {
          log.error("Build failed to complete!");
          log.error(error);
      } else {
          log.info("Build finished!");
      }

      building = false;
    });
}

const watcher = chokidar.watch("**", { 
    cwd: path.dirname(entrypoint_path), 
    persistent: true,
    ignored: ['node_modules', output_path],
    usePolling: true,
});

setTimeout(()=>{
    log.info("Starting watch");
    watcher.on('add', path => rebuild(`File ${path} has been added`))
    .on('change', path => rebuild(`File ${path} has been changed`))
    .on('unlink', path => rebuild(`File ${path} has been removed`));

    rebuild(`Program starting`)
}, 1500)
