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
        execSync(`npx tailwindcss -i - -o ${config.tailwind.output}`, { input:bundle_css }); 
        console.log(`Tailwind bundled to: ${f(config.tailwind.output, {color: "#c2ae00"})}`)
    }

    const plugins = [];
    if ( !config.use.socketio ) plugins.push({
        name: "socket.io-client Resolver",
        setup(build) {
            // Redirect all socket.io imports to the slimed version
            build.onResolve({ filter:/plugins\/socket\.io-client\.js/ }, args => {
                return {
                    path: path.resolve(path.join(__dirname,"../lib/shims/socket.io-client.js"))
                }
            })
        }
    })
    if ( !config.use.entangld ) plugins.push({
        name: "Entangld Resolver",
        setup(build) {
            // Redirect all socket.io imports to the slimed version
            build.onResolve({ filter:/plugins\/entangld\.js/ }, args => {
                return {
                    path: path.resolve(path.join(__dirname,"../lib/shims/entangld.js"))
                }
            })
        }
    })
    if ( !config.use.hashobject ) plugins.push({
        name: "HashObject Resolver",
        setup(build) {
            // Redirect all socket.io imports to the slimed version
            build.onResolve({ filter:/plugins\/hash-object\.js/ }, args => {
                return {
                    path: path.resolve(path.join(__dirname,"../lib/shims/hash-object.js"))
                }
            })
        }
    })
    if ( !config.use.request ) plugins.push({
        name: "Request Resolver",
        setup(build) {
            // Redirect all socket.io imports to the slimed version
            build.onResolve({ filter:/plugins\/request\.js/ }, args => {
                return {
                    path: path.resolve(path.join(__dirname,"../lib/shims/empty.js"))
                }
            })
        }
    })
    if ( !config.use.cookies ) plugins.push({
        name: "JS-Cookies Resolver",
        setup(build) {
            // Redirect all socket.io imports to the slimed version
            build.onResolve({ filter:/plugins\/js-cookie\.js/ }, args => {
                return {
                    path: path.resolve(path.join(__dirname,"../lib/shims/empty.js"))
                }
            })
        }
    })


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
                "process.env": env.toJSON(),
            },
            plugins
        }); 
    } catch (e) {
        console.log(`${f("Build bundling failed.", {color: "red"})}`);
        console.log(`Error: ${e}`)
        process.exit(1);
    }

    console.log(`${f("Build complete.", {color: "green"})}`);
}();
