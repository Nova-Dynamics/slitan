const { Partial } = require("../../../index.js")

//Require partial-specific css (will be bundled on build)
require("./collapse_button.css")

class CollapseButton extends Partial
{

    static template = require("./collapse_button.html");

    constructor(...args) {
        super(...args);

        this._collapsed = false;
    }


    set collapsed(v)
    {
        console.log("setting collapsed", v)
        this._collapsed = !!v;
        this.re_render();
    }

    // Override the base class post_render
    post_render()
    {
        this.html.click(()=>this.collapsed = !this._collapsed)
    }

    get icon()
    {
        return this._collapsed ? "🙂" : "🙃"
    }
}

module.exports = CollapseButton
