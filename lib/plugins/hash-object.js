
const { EventEmitter } = require("events");

class HashObject extends EventEmitter {
    constructor() {
        super();

        this._params = this._parse();
        window.addEventListener("hashchange", () => {
            this._update();
        });
    }

    _update() {
        const new_params = this._parse();
        for ( const [key, val] of this._params ) {
            // Handles either new params is missing value, or it changed
            if ( this._params.get(key) != new_params.get(key) ) {
                this.emit("change:"+key, new_params.get(key));
            }
        }
        for ( const [key, val] of new_params ) {
            // Handle old params is missing a value
            if ( !this._params.has(key) ) {
                this.emit("change:"+key, val);
            }
        }
        this._params = new_params;
        this.emit("change", this.object());
    }

    _parse() {
        return new URLSearchParams(
            window.location.hash.slice(1)
        );
    }

    toJSON() {
        return JSON.stringify(this._params);
    }
    toString() {
        return "#" + this._params.toString();
    }

    entries() {
        return this._params.entries();
    }
    object() {
        return Object.fromEntries(this._params);
    }
    params() {
        const params = new URLSearchParams();
        for ( const [key, value] of this._params.entries() ) {
            params.set(key, value);
        }
        return params;
    }
    get(key) {
        return this._params.get(key);
    }
    set(key, value) {
        const params = this.params();
        params.set(key, value);
        window.location.hash = params.toString();
    }
    delete(key) {
        const params = this.params();
        params.delete(key);
        window.location.hash = params.toString();
    }
    update(obj) {
        const params = this.params();
        for ( const key in obj ) {
            if ( obj[key] == null ) {
                params.delete(key);
            } else {
                params.set(key, obj[key]);
            }
        }
        window.location.hash = params.toString();
    }

    subscribe(key, callback) {
        this.on("change:"+key, callback);
    }
}

module.exports = HashObject;
