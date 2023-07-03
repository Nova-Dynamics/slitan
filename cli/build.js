#!/usr/bin/env node

const path = require('path');
const { execSync } = require("child_process");
const { Stream } = require('stream');
const fs = require('fs');
const CSSify = require("./CSSify")
const browserify = require('browserify');
const css_ignore = require("./css_ignore")
const fs_replace = require("./fs_replace")
const BuildConfiguration = require("./BuildConfiguration.js");
const EnvironmentVariables = require("./EnvironmentVariables.js");
const { f } = require("yaclc");

const config_fp = path.resolve(process.argv[2] || "slitan.config.js");
if (!fs.existsSync(config_fp)) {
    console.log(`${f("Build failed.", {color: "red"})}`);
    console.error(`Error: Configuration file '${config_fp}' does not exist.`);
    process.exit(1);
}

const config = BuildConfiguration.load(config_fp);
try {
    config.check_validity();
} catch(e) {
    console.log(`${f("Build failed.", {color: "red"})}`);
    console.error(e);
    process.exit(1);
}

const env = new EnvironmentVariables();
env.load(config.env_files);

// Create raw CSS bundle
let css = new CSSify()
const css_fp = path.join(config.output_folder, "bundle.css");
css.start(config.entrypoint)
css.bundle(css_fp)
console.log(`Bundling CSS: ${f(css_fp, {color: "#c2ae00"})}`)

// Create tailwind css bundle
if ( config.use.tailwind ) {
    const bundle_css = fs.readFileSync(css_fp).toString();
    console.log("Staring tailwindcss build ... ");
    execSync(`${path.resolve(path.join(__dirname, "../node_modules/.bin/tailwindcss"))} -i - -o ${css_fp}${config.minify?" --minify":""}`, { input:bundle_css }); 
    console.log(`Tailwind builded to: ${f(css_fp, {color: "#c2ae00"})}`)
}

// Create the Minify stream
let minifyStream;
if ( config.minify ) {
    minifyStream = require("minify-stream")();
} else {
    // Thanks to: https://github.com/GMTurbo/IdentityStream/blob/master/identityStream.js
    class IdentityStream extends Stream {
        write(data) { this.emit("data", data); }
        end() { this.emit("end"); }
        destroy() { this.emit("close"); }
    }
    minifyStream = new IdentityStream();
}

// Create javascript bundle
const b = browserify({
    entries: [config.entrypoint],
    extensions: ["js", "json"]
});

b.transform(css_ignore, {
    global: true
});
b.transform(fs_replace);
b.transform(env.transformer());

// Setup ignores
if ( !config.use.bootstrap ) b.ignore("bootstrap");
if ( !config.use.socketio ) b.ignore("socket.io-client");
if ( !config.use.entangld ) b.ignore("entangld");
if ( !config.use.cookies ) b.ignore("js-cookie");

// TODO : make this a configurartion option??
const bundle_fp = path.join(config.output_folder, "bundle.js");
b.bundle()
    .on('error', function(err) {
        console.log(`${f("Build failed.", {color: "red"})}`);
        console.log(`Error: ${err}`)
        process.exit(1);
    })
    .pipe(minifyStream)
    .pipe(fs.createWriteStream(bundle_fp))
    .on('finish', function(err) {
        if ( err ) {
            console.log(`${f("Build finished with error.", {color: "red"})}`);
            console.log(`Error: ${err}`)
        } else {
            console.log(`Bundling JS:  ${f(bundle_fp, {color: "#c2ae00"})}`)
            console.log(`${f("Build complete.", {color: "green"})}`);
        }
    })

