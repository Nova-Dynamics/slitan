const Mustache = require("mustache");

class PartialsRenderer
{

  constructor(template) {

    this.template = template
    
  }


  render(data)
  {
    return window.$(Mustache.render(this.template, data))
  }

  render_into(selector, data)
  {
    let el = this.render(data);
    window.$(selector).append(el);
    return el;
  }
}



module.exports = PartialsRenderer;
