#!/usr/bin/env node

const esbuild = require("esbuild");
const path = require('path');
const { execSync } = require("child_process");
const fs = require('fs');
const BuildConfiguration = require("./BuildConfiguration.js");
const EnvironmentVariables = require("./EnvironmentVariables.js");
const { f } = require("yaclc");

!async function() {

    // Load the configuration file
    const config_fp = path.resolve(process.argv[2] || "slitan.config.js");
    if (!fs.existsSync(config_fp)) {
        console.log(`${f("Build failed.", {color: "red"})}`);
        console.error(`Error: Configuration file '${config_fp}' does not exist.`);
        process.exit(1);
    }

    // Parse the configuration file
    const config = BuildConfiguration.load(config_fp);
    try {
        config.check_validity();
    } catch(e) {
        console.log(`${f("Build failed.", {color: "red"})}`);
        console.error(e);
        process.exit(1);
    }

    // Load any environment variables for the build
    const env = new EnvironmentVariables();
    env.load(config.env_files);

    // Create tailwind css bundle
    if ( config.use.tailwind ) {
        const bundle_css = fs.readFileSync(config.tailwind.entrypoint).toString();
        console.log("Staring tailwindcss build ... ");
        // execSync(`npx tailwindcss -i - -o ${config.tailwind.output}${config.minify?" --minify":""}`, { input:bundle_css }); 
        execSync(`npx tailwindcss -i - -o ${config.tailwind.output}`, { input:bundle_css }); 
        console.log(`Tailwind bundled to: ${f(config.tailwind.output, {color: "#c2ae00"})}`)
    }


    // Render out the js bundle
    const bundle_fp = path.join(config.output_folder, "bundle.js");
    try {
        console.log(`Bundling JS:  ${f(bundle_fp, {color: "#c2ae00"})}`)
        await esbuild.build({
            entryPoints: [config.entrypoint],
            minify: config.minify,
            sourcemap: config.source_map,
            bundle: true,
            outfile: bundle_fp,
            color: true,
            logLevel: config.log_level,
            loader: {
                ".json": "json",
                ".css": "css",
                ".html": "text",
            },
            define: {
                ...env.get() 
            },
        }); 
    } catch (e) {
        console.log(`${f("Build bundling failed.", {color: "red"})}`);
        console.log(`Error: ${e}`)
        process.exit(1);
    }

    console.log(`${f("Build complete.", {color: "green"})}`);

    // // Setup ignores
    // if ( !config.use.bootstrap ) b.ignore("bootstrap");
    // if ( !config.use.socketio ) b.ignore("socket.io-client");
    // if ( !config.use.entangld ) b.ignore("entangld");
    // if ( !config.use.cookies ) b.ignore("js-cookie");

}();
