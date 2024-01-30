
const { readFileSync, existsSync } = require("fs");
const dotenv = require("dotenv");

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
                if ( this.include(key) ) this.env[this.slice(key)] = value; 
            }
        }
        return this;
    }

    include(key) {
        return key.startsWith("SLITAN_PUBLIC_");
    }

    slice(key) {
        return key.slice(14);
    }

    toJSON() {
        return JSON.stringify(this.env);
    }
}

module.exports = EnvironmentVariables;
