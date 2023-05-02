const PartialsRenderer = require("../lib/PartialsRenderer")
const { EventEmitter } = require("events");
const path = require('path');

//cssify
require('../css/base_styles.css');
require('../css/loading_wheel.css');

/**
 * Represents a partial view that can be rendered into a container and can contain child partials
 * @class Partial
 * @extends EventEmitter
 */
class Partial extends EventEmitter {

    /**
     * @constructor
     * @param {string} template - The template for the partial
     */
    constructor(template) {

        super();

        this.partial = new PartialsRenderer(template);
        this.html = null;

        this.children_partials = [];
    }

    /**
     * Add a partial to the list of children partials
     * @method add_child
     * @param {Partial} partial - The partial to add.
     * @param {string} [selector=null] - The selector to use render the child into (if none, will be rendered into the top level)
     */
    add_child(partial, selector=null) {
        this.children_partials.push([ partial, selector ]);
    }


    /**
     * Remove a partial from the list of children partials
     * @method remove_child
     * @param {Partial} partial - The partial to remove
     */
    remove_child(partial) {
        this.children_partials = this.children_partials.filter((p)=>p[0]!==partial);
    }

    /**
     * Called before rendering -- override to add custom logic
     * @method pre_render
     */
    pre_render() {
    }

    /**
     * Called after rendering -- override to add custom logic
     * @method post_render
     */
    post_render() {
    }


    /**
     * Set the loading state of the partial
     * @method set_loading
     * @param {boolean} loading - True if loading, false otherwise
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
     * Render the partial into a container
     * @method render_into
     * @param {HTMLElement} container - The container element to render the partial into
     * @param {*} [data=null] - The data to pass to the partial for rendering
     * @returns {HTMLElement} - The HTML element containing the rendered partial
     */
    render_into(container, data=null) {
        this.container = container;
        this.pre_render();
        this.html = this.partial.render_into(container, data ? data : this)
        this.post_render_before_children()
        this.render_children();
        this.post_render();
        this.emit("rendered", this.html);
        return this.html
    }

    /**
     * Called before rendering children -- override to add custom logic
     * @method post_render_before_children
     */
    post_render_before_children() {
    }

    /**
     * Re-render the partial with new data
     * @method re_render
     * @param {*} [data=null] - The data to pass to the partial for rendering
     * @returns {HTMLElement} - The HTML element containing the re-rendered partial
     */
    re_render(data=null) {
        if (this.container)
        {
            this.pre_render();
            let h = this.partial.render(data ? data : this)
            this.html.replaceWith(h)
            this.html = h;
            this.post_render_before_children()
            this.render_children();
            this.post_render();
            this.emit("rendered", this.html);

            return this.html
        }
    }

    /**
     * Render the child partials into the current HTML element
     * @method render_children
     */
    render_children() {
        for ( const [ child, selector ] of this.children_partials )
            {
                if (!selector)
                    child.render_into(this.html);
                else
                    child.render_into(this.html.find(selector));
            }
    }

    /**
     * Show or hide the partial
     * @method show
     * @param {boolean} s - True to show, false to hide
     */
    show(s)
    {
        if (s)
            this.html.show()
        else
            this.html.hide()
    }

    /**
     * Check if the partial has been rendered
     * @method rendered
     * @returns {boolean} - True if the partial has been rendered, false otherwise
     */
    get rendered() {
        return !!this.html;
    }
}

module.exports = Partial;
