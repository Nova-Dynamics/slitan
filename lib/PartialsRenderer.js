const Mustache = require("mustache");

class PartialsRenderer
{

  constructor(template) {

    this.template = template
    
  }


  /**
   * Takes a data object, renders it using Mustache, and returns the result as a jQuery object
   * @param data - The data to be passed to the template.
   * @returns A jQuery object
   */
  render(data)
  {
    return window.jQuery(Mustache.render(this.template, data))
  }

  /**
   * Render the template into the given selector, and return the element.
   * @param selector - The selector of the element to render into.
   * @param data - The data to be passed to the template.
   * @returns The element that was appended to the DOM.
   */
  render_into(selector, data)
  {
    let el = this.render(data);
    window.jQuery(selector).append(el);
    return el;
  }
}



module.exports = PartialsRenderer;
