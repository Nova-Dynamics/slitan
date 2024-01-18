const { Page } = require("../../index.js")
const CollapseButton = require("./partials/CollapseButton")

//Require page-specific css (will be bundled on build)
require("./home-page.css")

class HomePage extends Page
{
    static page_name = "homepage";

    async init() {
        // Construct the button partial
        this.collapse_btn_partial = CollapseButton.for_page(this);
    }


    async load() {
        // Actually render, now that the DOM is ready
        this.collapse_btn_partial.render_into(this.container_selector);
    }
}

module.exports = HomePage;