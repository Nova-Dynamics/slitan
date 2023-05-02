/**
 * The entry point for the application.
 *
 * @class EntryPoint
 */
class EntryPoint
{
    /**
     * Constructor
     */
    constructor()
    {
        // Only want this once, so it happens here
        window.$ = require("jquery");
        window.jQuery = window.$;

        this.pages = new Map();
    }

    /**
     * Starts the application.
     */
    async start()
    {
        let auth_valid = await this.check_auth()

        if (auth_valid)
            this.load()
    }

    async check_auth()
    {
        return true;
    }

    /**
     * Loads the application page
     */
    async load()
    {

    }

    /**
     * Add a page to the application
     *
     * @param {Page} page
     */
    add_page(page_class)
    {
        const page = new page_class();
        this.pages.set(page.page_name, page);
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
    async load_page(page_name) {
        const page = this.get_page(page_name);

        if ( !page ) throw new Error("Unknown page name: "+page_name);

        // Update the 'page' query parameter:
        let url = new URL(window.location.href)
        url.searchParams.set('page', page_name)
        window.history.pushState({}, '', url)
    }
}

module.exports = EntryPoint
