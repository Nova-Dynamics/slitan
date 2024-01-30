
# Slitan

Slitan is a web UI framework that provides a convenient way to build and manage UI components. It comes with a set of default components and tools for building custom components.


![Logo](./assests/logo.png)


## Authors

- [@Sean Sullivan](https://www.github.com/AFIDclan)
- [@Jonathan Van Schenck](https://www.github.com/https://github.com/jonathanvanschenck)

## Features

- Custom build and watch pipelines
- Modular css/html packaging
- Easy setup and configuration
- Automatic asset bundling and minification
## Installation

Install slitan with npm

```bash
  npm install slitan
```
    
## Usage/Examples

### Basic Example

```bash
cd slitan/examples/basic
node ../../cli/build.js
chrome ./public/index.html
```

### Entrypoint

The Index class extends EntryPoint, which is a class provided by Slitan that serves as the entry point for the web application. The Index class defines two methods: init() and load().

init() is an asynchronous method that allows pre-DOM-ready setup code to be run.

load() is an asynchronous method for post-DOM-ready setup

After defining the Index class, an instance of the class is created and started by calling the start() method on it. This method is provided by the EntryPoint class and sets up the html page

```javascript
const { EntryPoint } = require("slitan")

class Index extends EntryPoint
{
    constructor()
    {
        super();
    }

    async init()
    {
        // Add some pages to be rendered
        this.add_page(require("./pages/FilterPage/FilterPage"))
        this.add_page(require("./pages/CalendarPage/CalendarPage"))
    }

    async load()
    {
        // Load the current page
        return this.load_page(this.current_page);
    }
}


let index = new Index()
index.start()

```

### Page
The Page class provides methods and properties that can be used to interact with and manipulate a web page.

The Page class is also designed to be extended by other classes that represent specific pages of a website. These classes can inherit the methods and properties of the Page class and add their own methods and properties specific to their respective pages.

```javascript

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

```

### PartialsRenderer

PartialsRenderer is a class that helps render HTML partials/templates in a more modular and organized way. It allows you to break down complex UIs into smaller, reusable components or partials, which can then be rendered on demand, making it easier to manage and maintain your UI code.

The class itself wraps around the Mustache library, which is used to compile and render the partial templates. It provides an API for compiling and rendering the partials, as well as attaching event listeners to the rendered elements. Additionally, it also supports passing data to the partials during rendering, making it easy to create dynamic and responsive UIs.

```javascript
const {PartialsRenderer} = require("slitan");

const renderer = new PartialsRenderer("<div>Hello {{name}}!</div>");

const html = renderer.render({ name: "John" });

console.log(html);
```

This will output the following HTML:
```html
<div>Hello John!</div>
```

### Partial
The Partial class extends the Node.js EventEmitter class, which allows it to emit events that other parts of the application can listen for and respond to.

The constructor takes a template argument, which is an HTML template string that defines the structure of the component. The constructor creates a new instance of the PartialsRenderer class, passing the template string as an argument. The PartialsRenderer class is responsible for rendering the template into the DOM.

The Partial class has several methods:

* pre_render(): This method is called before rendering the component and can be overridden to add custom logic.
* post_render(): This method is called after rendering the component and can be overridden to add custom logic.
* render_into(container, data=null): This method takes a container element as its first argument and an optional data object as its second argument. It renders the component into the container element using the PartialsRenderer class and returns the rendered HTML element. It also emits a "rendered" event with the rendered HTML element as the argument.
* re_render(): This method removes the existing HTML element from its container and renders a new instance of the component into the same container element.
* create_child(PartialConstructor, css_selector=null, opts={}): This method allows other partials to be added as children of this partial.
* show(s): This method takes a boolean argument that specifies whether to show or hide the component. If s is true, the method shows the component by setting its display property to "block". If s is false, the method hides the component by setting its display property to "none".
* for_page(page, opts={}): A static method for constructing this partial as the direct child of a page.


#### CollapseButton.js

Below is a basic example of a Partial. Notice that getters can be used to fill out the html template with dynamic data.
On Post render, the click event is attached to the button to toggle the collapsed state. The partial is then re-rendered and the icon is automatically updated.


```html
<button class="collapse-btn">{{icon}}</button>
```

```javascript
const { Partial } = require("../../../index.js")

// Require partial-specific css (will be bundled on build)
require("./collapse_button.css")

class CollapseButton extends Partial
{

    // Require partial-specific html (will be bundled on build)
    static template = require("./collapse_button.html")

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
```


## Version 3.x
### New Features
- HashObject plugin
- Bundling of source maps by defaults (disable in `slitan.config.js` via the `source_map` flag)
### Migrating from 2.x to 3.x
- All occurrences of `slitan_bundle_resource(...)` should be replaced with `require(...)`
- All occurrences of `process.env.SLITAN_PUBLIC_<rest-of-name>` should be replaced with `process.env.<rest-of-name>`
- Browserify's auto-polyfilling of nodejs core libraries has been removed, you can add back in the subset which you need. E.g. `npm install path-browserify`
- Tailwind support has be reordered to utilitize esbuild's css minification (rather than minifying the css twice), which means that apps should `require`
   the tailwind-bundled css file, rather than the tailwind css entrypoint file. Usually this means if you have a `require("./tailwind.css")` in your js entrypoint,
   you will need to change this to a `require("./public/bundle.tailwind.css")`.
- The `request` plugin has been moved to the Entrypoint object, and disabled by default (enabled with `slitan.config.js` flag `use.request`. So, all occurrences of `window.request`
   should be replaced with `app.request`

