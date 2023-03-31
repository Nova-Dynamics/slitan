
# Slitan

Slitan is a web UI framework that provides a convenient way to build and manage UI components. It comes with a set of default components and tools for building custom components.


![Logo](https://lh3.googleusercontent.com/u/0/drive-viewer/AAOQEOTdWtlX8mxTEs04lwUgH9sZnFJT3_H5L7elplKVWMBra8r3oemZuGRVd94zYuO6Y8-Haz3zu5716bXV0qU3hxr8a7QeLg=w1920-h880)


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
  cd slitan
```
    
## Usage/Examples

### Entrypoint

The Index class extends EntryPoint, which is a class provided by Slitan that serves as the entry point for the web application. The Index class defines two methods: check_auth() and load().

check_auth() is an asynchronous method that checks if the user is authenticated. In this example, the method simply returns true. In a real-world scenario, this method would likely contain authentication logic to verify the user's credentials.

load() is a function called to set up your environment. In this example, two pages are added: FilterPage, and CalendarPage

After defining the Index class, an instance of the class is created and started by calling the start() method on it. This method is provided by the EntryPoint class and sets up the html page

```javascript
const { EntryPoint } = require("slitan")

class Index extends EntryPoint
{
    constructor()
    {
        super();
    }

    async check_auth()
    {
        // Check if user is authenticated
        // ...
        // User checks out!
        return true;
    }

    async load()
    {
        //Add some pages to be rendered
        this.add_page(require("./pages/FilterPage/FilterPage"))
        this.add_page(require("./pages/CalendarPage/CalendarPage"))
    }
}


let index = new Index()
index.start()

```

### Page
The Page class provides methods and properties that can be used to interact with and manipulate a web page.

The Page class is also designed to be extended by other classes that represent specific pages of a website. These classes can inherit the methods and properties of the Page class and add their own methods and properties specific to their respective pages.

```javascript

const { Page } = require("slitan")
const CollapseButton = require("./CollapseButton")

//Require page-specific css (will be bundled on build)
require("./calendar.css")

class CalendarPage extends Page
{

  constructor() {
    
    // Run this page only on when the 'page=calendar' query params is true
    super("calendar", "/");

    this.collapse_button = new CollapseButton()

    $(document).ready(()=>this.load());

  }

  async load()
  {
    this.html = $("#main-container").empty()

    //Render the partial into the dom
    this.collapse_button.render_into(this.html)

  }

}

module.exports = CalendarPage;

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
* set_loading(loading): This method takes a boolean argument that specifies whether to show or hide a loading spinner. If loading is true, the method adds a loading spinner to the container element and sets its position to relative. If loading is false, the method removes the loading spinner from the container element and resets its position to unset.
* render_into(container, data=null): This method takes a container element as its first argument and an optional data object as its second argument. It renders the component into the container element using the PartialsRenderer class and returns the rendered HTML element. It also emits a "rendered" event with the rendered HTML element as the argument.
* re_render(): This method removes the existing HTML element from its container and renders a new instance of the component into the same container element.
* show(s): This method takes a boolean argument that specifies whether to show or hide the component. If s is true, the method shows the component by setting its display property to "block". If s is false, the method hides the component by setting its display property to "none".

#### collapse_button.html
```html
<button class="collapse-btn"><img src="svg/{{icon}}.svg"></img></button>
```

#### collapse_button.css
```css
.collapse-btn {
    border-radius: 50%; 
    right: -20px;
    top:10%;
    position: absolute;
    border: none;
    color: var(--font-primary-color);
    aspect-ratio: 1 / 1;
    background-color: transparent;
}

```

#### CollapseButton.js
```javascript
const { Partial } = require("slitan")

//Require partial-specific css (will be bundled on build)
require("./collapse_button.css")

class CollapseButton extends Partial
{
    constructor()
    {
        //Require partial-specific html (will be bundled on build)
        let template = fs.readFileSync("./collapse_button.html")
        
        super(template)

        this._collapsed = false;

    }

    set collapsed(v)
    {
        this._collapsed = !!v;
        this.re_render();
    }

    // Override the base class post_render
    post_render()
    {
        this.html.click(()=>this.emit("collapse", !this._collapsed))
    }

    get icon()
    {
        return this._collapsed ? "right-arrow-btn" : "left-arrow-btn"
    }
}

module.exports = CollapseButton
```