#!/usr/bin/env node

const path = require('path');
const { Stream } = require('stream');
const fs = require('fs');
const CSSify = require("./CSSify")
const browserify = require('browserify');
const css_ignore = require("./css_ignore")
const fs_replace = require("./fs_replace")
const { f } = require("yaclc");

const entrypoint_file = process.argv[2];
const output_directory = process.argv[3];
const minify = !!process.argv[4];

if (!entrypoint_file || !output_directory) {
  console.log(`${f("Build failed.", {color: "red"})}`);
  console.error('Error: Please provide the entrypoint file and output directory.');
  process.exit(1);
}

const entrypoint_path = path.resolve(entrypoint_file);
const output_path = path.resolve(output_directory, 'bundle.js');

if (!fs.existsSync(entrypoint_path)) {
  console.log(`${f("Build failed.", {color: "red"})}`);
  console.error(`Error: Entrypoint file '${entrypoint_file}' does not exist.`);
  process.exit(1);
}

if (!fs.existsSync(output_directory)) {
  console.log(`${f("Build failed.", {color: "red"})}`);
  console.error(`Error: Output directory '${output_directory}' does not exist.`);
  process.exit(1);
}

let css = new CSSify()
css.start(entrypoint_path)

css.bundle(output_directory)

// Thanks to: https://github.com/GMTurbo/IdentityStream/blob/master/identityStream.js
class IdentityStream extends Stream {
    write(data) { this.emit("data", data); }
    end() { this.emit("end"); }
    destroy() { this.emit("close"); }
}

let minifyStream;
if ( minify ) {
    minifyStream = require("minify-stream")();
} else {
    minifyStream = new IdentityStream();
}

const b = browserify({
    entries: [entrypoint_path],
    extensions: ["js", "json"]
  });

  b.transform(css_ignore, {
    global: true
  });

  b.transform(fs_replace);

  b.bundle()
  .on('error', function(err) {
    console.log(`${f("Build failed.", {color: "red"})}`);
    console.log(`Error: ${err}`)
    process.exit(1);
  })
  .pipe(minifyStream)
  .pipe(fs.createWriteStream(output_path))
  .on('finish', function(err) {
    console.log(`${f("Build complete.", {color: "green"})}`);
    console.log(`Output files: ${f(output_directory + "bundle.js", {color: "#c2ae00"})}, ${f(output_directory + "bundle.css", {color: "#c2ae00"})}`)
  })


