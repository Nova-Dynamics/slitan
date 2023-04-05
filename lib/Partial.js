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

        this.children_partials = [];
    }

    /**
     * Add a partial to the list of children partials
     * @param partial - The partial to add.
     * @param [selector=null] - The selector to use render the child into (if none, will be rendered into the top level)
     */
    add_child(partial, selector=null) {
        this.children_partials.push([ partial, selector ]);
    }
    
    // Called before rendering -- override to add custom logic
    pre_render() {
    }

    // Called after rendering -- override to add custom logic
    post_render() {
    }

    /**
     * Add a loading wheel to the parent element of the html element that the class is attached to
     * @param loading - boolean
     */
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

    /**
     * It renders the partial into the container, and then renders the children into the container or into
     * the child's selector
     * @param container - The container to render the partial into.
     * @param [data=null] - The data to pass to the partial. If null, the view itself is passed.
     * @returns The html of the rendered partial.
     */
    render_into(container, data=null) {
        this.container = container;
        this.pre_render();
        this.html = this.partial.render_into(container, data ? data : this)
        for ( const [ child, selector ] of this.children_partials )
        {
            if (!selector)
                child.render_into(this.html);
            else
                child.render_into(this.html.find(selector));
        }
        this.post_render();
        this.emit("rendered", this.html);
        return this.html
    }


    /**
     * It removes the HTML element from the DOM, and then re-renders it
     */
    re_render(data=null) {
        if (this.container)
        {
            this.pre_render();
            let h = this.partial.render(data ? data : this)
            this.html.replaceWith(h)
            this.html = h;

            for ( const [ child, selector ] of this.children_partials )
            {
                if (!selector)
                    child.render_into(this.html);
                else
                    child.render_into(this.html.find(selector));
            }

            this.post_render();
            this.emit("rendered", this.html);

            return this.html
        }
    }

    /**
     * "If the argument is true, show the HTML element, otherwise hide it."
     * 
     * The function is called like this:
     * @param s - boolean
     */
    show(s)
    {
        if (s)
            this.html.show()
        else
            this.html.hide()
    }
}

module.exports = Partial;
