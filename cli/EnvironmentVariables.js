
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
                if ( this.include(key) ) this.env[key] = value; 
            }
        }
        return this;
    }

    get(key) {
        return this.env[key];
    }

    include(key) {
        return key.startsWith("SLITAN_PUBLIC_");
    }

    transformer() {
        const self = this;
        return function(file, options) {
            const stream = through(write, end);
            return stream;

            function write(buffer, encoding, next) {
                this.push(buffer.toString().replace(
                    /process.env.(SLITAN_PUBLIC_\w+)/g,
                    function(match, env_key) {
                        const value = self.get(env_key);
                        if ( value == undefined ) return undefined;
                        return `"${value}"`;
                    }
                ));
                next();
            }

            function end(done) { done(); }
        }
    }
}

module.exports = EnvironmentVariables;
