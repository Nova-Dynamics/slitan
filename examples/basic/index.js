const { EntryPoint } = require("../../index.js")

class Index extends EntryPoint
{
    constructor()
    {
        super();
    }

    async init()
    {
        // Add some pages to be rendered
        this.add_page(require("./HomePage"), "#content")
    }

    async load()
    {
        // Load the current page
        return this.load_page("homepage");
    }
}


let index = new Index()
index.start()