const IO = require("./plugins/socket.io-client.js");
const Datastore = require("./plugins/entangld.js");
const { EventEmitter } = require("events");

class Page extends EventEmitter {
  static page_name = "";
  get page_name() { return this.constructor.page_name; }

  constructor(app, container_selector, { io, use_entangld=false, allow_null_loads=false }={}) {
    super();

    this.app = app;
    this.container_selector = container_selector;

    if (io) this.io = IO(...io);
    if (use_entangld) {
      this.datastore = new Datastore();
      this.datastore.transmit((msg, store) => store.receive(msg,this.datastore));
      this.datastore.attach(`app`, app.datastore);
      this.datastore.set(`partials`, {});
    }

    this.children_partials = [];

    // Auto-start if on correct page
    if ( this.on_correct_page(allow_null_loads) ) this.start();
  }

  /**
   * Add a partial to the list of children partials
   * @method add_child
   * @param {Partial} partial - The partial to add.
   * @param {string} [selector=null] - The selector to use render the child into (if none, will be rendered into the top level)
   */
  create_child(Partial, opts={}) {
    const partial = new Partial(this, null, opts);
    this.children_partials.push(partial);
    if ( this.datastore ) {
      const name = opts.name ?? this.children_partials.length - 1;
      this.datastore.attach(`partials.${name}`, partial.datastore);
    }
    return partial;
  }


  async start() {
    console.log("starting", this.page_name);
    await this.init().then(() => this.emit("init"));
    return new Promise(res => {
        window.$(document).ready(async()=>{
            await this.load();
            this.emit("start");
            res();
        });
    });
  }

  async init() {}
  async load() {}

  on_correct_page(allow_null = false) {
    if (allow_null && this.app.current_page == undefined) {
      return true;
    }

    if (this.page_name.match(this.app.current_page) ) {
      return true;
    }

    return false;
  }

  emit_io() {
    if (arguments.length < 1)
      throw new Error("Invalid arguments")

    return new Promise((resolve, reject) => {

      this.io.emit(...arguments, ({ data, error }) => {
        if (error)
          reject(error);
        else
          resolve(data);
      })
    })
  }
}



module.exports = Page;
