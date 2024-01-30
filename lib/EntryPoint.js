
const { EventEmitter } = require("events");
const Datastore = require("./plugins/entangld.js");
const HashObject = require("./plugins/hash-object.js");


window.$ = require("jquery");
window.jQuery = window.$;

/**
 * The entry point for the application.
 *
 * @class EntryPoint
 */
class EntryPoint extends EventEmitter {
    /**
     * Constructor
     */
    constructor()
    {

        super();

        // Only want this once, so it happens here
        this.Cookies = require("./plugins/js-cookie.js");
        this.request = require("./plugins/request.js");

        this.hash_object = new HashObject();

        this.datastore = new Datastore();
        this.datastore.set("", {
            pages: {}
        });
        this.datastore.transmit((msg, store) => store.receive(msg,this.datastore));

        this.current_page = (new URLSearchParams(window.location.search)).get("page");

        this.pages = new Map();

    }

    /**
     * Starts the application.
     */
    async start()
    {
        await this.init().then(() => this.emit("init"));
        return new Promise(res => {
            window.$(document).ready(async()=>{
                await this.load();
                this.emit("start");
                res();
            });
        });
    }

    /**
     * Run any pre-load (i.e. setup logic and construction, but no DOM-manipulation)
     */
    async init()
    {

    }

    /**
     * Loads the application page (i.e. after the DOM is ready)
     */
    async load()
    {

    }

    /**
     * Add a page to the application
     *
     * @param {Page} Page
     */
    add_page(Page, container_selector="body", opts={})
    {
        const page = new Page(this, container_selector, opts);

        if ( page.datastore )
            this.datastore.attach(`pages.${Page.page_name}`, page.datastore);
        else
            this.datastore.set(`pages.${Page.page_name}`, {});

        this.pages.set(Page.page_name, page);
    }

    /**
     * Get a page by its name
     * @param {string} page_name
     * @returns {Page}
     */
    get_page(page_name) {
        return this.pages.get(page_name) ?? null;
    }

    /**
     * Load a page
     */
    async load_page(page_name, force_refresh=false) {
        if ( page_name == this.current_page && !force_refresh ) return;
        const page = this.get_page(page_name);

        if ( !page ) throw new Error("Unknown page name: "+page_name);

        // Update the 'page' query parameter:
        // let url = new URL(window.location.href)
        // url.searchParams.set('page', page_name)
        // window.history.pushState({}, '', url)
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("page", page_name);
        window.location.search = urlParams;
    }
}

module.exports = EntryPoint
