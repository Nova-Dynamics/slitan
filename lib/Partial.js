const PartialsRenderer = require("../lib/PartialsRenderer.js")
const Datastore = require("./plugins/entangld.js");
const { EventEmitter } = require("events");

/**
 * Represents a partial view that can be rendered into a container and can contain child partials
 * @class Partial
 * @extends EventEmitter
 */
class Partial extends EventEmitter {
    static template = "";

    static for_page(page, opts={}) {
        return page.create_child(this, opts);
    }

    /**
     * @constructor
     */
    constructor(page, parent=null, opts={/* use me in sub-classes */}) {

        super();

        this.page = page;
        this.parent = parent;

        this.partial = new PartialsRenderer(this.constructor.template);
        this.html = null;

        this.children_partials = [];

        if ( page.datastore ) {
            this.datastore = new Datastore();
            this.datastore.transmit((msg, store) => store.receive(msg,this.datastore));
            this.datastore.attach(`page`, page.datastore);
            const parent_ds = parent?.datastore ?? page.datastore;
            this.datastore.attach(`parent`, parent_ds);
            this.datastore.set(`partials`, {});
        }
    }

    /**
     * Add a partial to the list of children partials
     * @method add_child
     * @param {Partial} partial - The partial to add.
     * @param {string} [selector=null] - The selector to use render the child into (if none, will be rendered into the top level)
     */
    create_child(Partial, selector=null, opts={}) {
        const partial = new Partial(this.page, this, opts);
        this.children_partials.push([ partial, selector ]);
        if ( this.datastore ) {
            const name = opts.name ?? selector ?? this.children_partials.length - 1;
            this.datastore.attach(`partials.${name}`, partial.datastore);
        }
        return partial;
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
