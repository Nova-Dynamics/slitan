const { join } = require("path");


module.exports = {
    "entrypoint": join(__dirname, "index.js"),
    "output_folder": join(__dirname, "public"),
    minify: false,
    "use": {
        "jquery": true,
        "tailwind": false,
        "entangld": false,
    }
}

