const PartialsRenderer = require("../lib/PartialsRenderer")
const { EventEmitter } = require("events");
const path = require('path');

//cssify
require('../css/base_styles.css');
require('../css/loading_wheel.css');

class Partial extends EventEmitter {

    constructor(template) {

        super();

        this.partial = new PartialsRenderer(template);
        this.html = null;
    }
    
    // Called before rendering -- override to add custom logic
    pre_render() {
    }

    // Called after rendering -- override to add custom logic
    post_render() {
    }

    set_loading(loading) {

        if (loading)
        {
            this.html.parent().css({"position": "relative"})
            this.html.parent().append(`<div class="loading"><div class="loading-wheel"></div><div class="loading-text"></div></div>`)
        } else {
            this.html.parent().css({"position": "unset"})
            this.html.parent().find(".loading").remove();
        }
    }

    render_into(container, data=null) {
        this.container = container;
        this.pre_render();
        this.html = this.partial.render_into(container, data ? data : this)
        this.post_render();
        this.emit("rendered", this.html);
        return this.html
    }


    re_render() {
        if (this.container)
        {
            this.html.remove();
            this.render_into(this.container);
        }
    }

    show(s)
    {
        if (s)
            this.html.show()
        else
            this.html.hide()
    }
}

module.exports = Partial;