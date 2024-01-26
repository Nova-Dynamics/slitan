
const { readFileSync, existsSync } = require("fs");
const dotenv = require("dotenv");
const through = require('through2');

class EnvironmentVariables {
    constructor() {
        this.env = {};
    }

    load(env_files) {
        for ( const key in process.env ) {
            if ( this.include(key) ) this.env[key] = process.env[key]; 
        }
        for ( const fp of env_files ) {
            if ( !existsSync(fp) ) continue;
            for ( const [ key, value ] of Object.entries(dotenv.parse(readFileSync(fp))) ) {
                if ( this.include(key) ) this.env[key] = this.render_value(value); 
            }
        }
        return this;
    }

    include(key) {
        return key.startsWith("SLITAN_PUBLIC_");
    }

    render_value(value) {
        // Needs this to properly escape strings
        return JSON.stringify(value);
    }

    get() {
        return this.env;
    }
}

module.exports = EnvironmentVariables;
