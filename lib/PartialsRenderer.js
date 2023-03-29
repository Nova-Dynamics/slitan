const Mustache = require("mustache");
const $ = window.$;
const path = require('path');

class PartialsRenderer
{

  constructor(template) {

    this.template = template
    
  }


  render(data)
  {
    return $(Mustache.render(this.template, data))
  }

  render_into(selector, data)
  {
    let el = this.render(data);
    $(selector).append(el);
    return el;
  }
}



module.exports = PartialsRenderer;
