class EntryPoint
{
    constructor()
    {
        window.$ = require("jquery");
        window.jQuery = window.$;

        this.pages = []
    }

    async start()
    {
        let auth_valid = await this.check_auth()

        if (auth_valid)
            this.load()
    }

    async check_auth()
    {

    }

    async load()
    {

    }

    add_page(page_class)
    {
        this.pages.push(new page_class())
    }
}

module.exports = EntryPoint