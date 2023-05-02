const Page = require("./lib/Page")
const Partial = require("./lib/Partial")
const PartialsRenderer = require("./lib/PartialsRenderer")
const EntryPoint = require("./lib/EntryPoint")

function slitan_bundle_resource(path) {
    throw new Error("Check your build");
}

module.exports = { Page, Partial, PartialsRenderer, EntryPoint, slitan_bundle_resource }
