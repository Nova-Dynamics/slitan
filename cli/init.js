#!/usr/bin/env node

const { resolve } = require("path");
const { writeFileSync, existsSync } = require("fs");

const { program } = require("commander");

const slitan_template = {
    entrypoint: "index.js",
    output_folder: "public",
    use: {}
};
const tailwind_template = {
    content: [
        "./lib/**/*.{html,js}",
        "./pages/**/*.{html,js}",
        "./public/index.html",
    ],
    theme: {
        extend: {}
    },
    plugins: []
};

const options = program.name("slitan-init")
    .description("Initialize your new slitan app")
    .version(require("../package.json").version)
    .option("-t, --use-tailwind", "Add tailwind initalization too")
    .option("-s, --use-socketio", "Include socket.io")
    .option("--slitan-config <fp>", "File name for slitan configuration", "slitan.config.js")
    .action((_, options) => {
    })
    .parse()
    .opts()

if ( options.useSocketio ) slitan_template.use.socketio = true;
if ( options.useTailwind ) {
    slitan_template.use.tailwind = true;
    if ( existsSync("tailwind.config.js") ) {
        console.log("Tailwind config already exists, skipping...");
    } else {
        console.log("Writing tailwind config to tailwind.config.js");
        writeFileSync("tailwind.config.js", "\nmodule.exports = "+JSON.stringify(tailwind_template, null, 4)); 
    }
    if ( existsSync("tailwind.css") ) {
        console.log("Tailwind entrypoint already exists, skipping...");
    } else {
        console.log("Writing tailwind entrypoint to tailwind.css");
        writeFileSync("tailwind.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;"); 
    }
} 
if ( existsSync(options.slitanConfig) ) {
    console.log("Slitan config already exists, skipping...");
} else {
    console.log("Writing tailwind config to "+options.slitanConfig);
    writeFileSync(options.slitanConfig, "\nmodule.exports = "+JSON.stringify(slitan_template, null, 4)); 
}

console.log("Done.");

