
const { existsSync } = require("fs");
const { resolve } = require("path");

class BuildConfigError extends Error {}

class BuildConfiguration {
    constructor(build={}) {
        this.entrypoint = resolve(build?.entrypoint ?? "index.js");
        this.output_folder = resolve(build?.output_folder ?? "public");
        this.env_files = (build?.env_files ?? []).map(fp => resolve(fp)),
        this.minify = !!(build?.minify ?? false);
        this.use = {
            bootstrap: !!(build?.use?.bootstrap ?? false),
            cookies: !!(build?.use?.cookies ?? true),
            tailwind: !!(build?.use?.tailwind ?? false),
            socketio: !!(build?.use?.socketio ?? false),
            entangld: !!(build?.use?.entangld ?? false),
            hashobject: !!(build?.use?.hashobject ?? false),
        };
    }

    check_validity() {
        if ( !existsSync(this.entrypoint) ) throw new BuildConfiguration(`Missing entrypoint file: ${this.entrypoint}`);
        if ( !existsSync(this.output_folder) ) throw new BuildConfiguration(`Missing output folder: ${this.output_folder}`);
    }

    static load(config_fp) {
        return new this(require(config_fp));
    }

    static default() {
        return new this();
    }
}

module.exports = BuildConfiguration;
