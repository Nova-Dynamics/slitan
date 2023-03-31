#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { execSync } = require('child_process');
const { Logger } = require("yalls");

let log;

//Set up logging to color the message as the log type
let log_cb = (level, string) => console.log([string.split("|")[0], log.f(string.split("|")[1], {color: log.type_to_color(level)})].join("|"))

// Create a logger
log = Logger.callback(log_cb, "", { format:"[:ISO] | :STRING" });

const entrypoint_file = process.argv[2];
const output_directory = process.argv[3];

if (!entrypoint_file || !output_directory) {
  log.error('Error: Please provide the entrypoint file and output directory.');
  process.exit(1);
}

const entrypoint_path = path.resolve(entrypoint_file);
const output_path = path.resolve(output_directory);

if (!fs.existsSync(entrypoint_path)) {
  log.error(`Error: Entrypoint file '${entrypoint_file}' does not exist.`);
  process.exit(1);
}

if (!fs.existsSync(output_directory)) {
  log.error(`Error: Output directory '${output_directory}' does not exist.`);
  process.exit(1);
}

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
    try {
      execSync(`slitan-build ${entrypoint_file} ${output_directory}`);
    } catch (error) {
      log.error("ERR!");
    }
    
    log.info("Build finished!");

    building = false;

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
}, 1500)
