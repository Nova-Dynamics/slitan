//const IO = require("socket.io-client");
const Cookies = require("js-cookie");

class Page {

  constructor(page_name, io_path=null) {
    this.page_name = page_name;

    if (io_path)
      this.io = IO(io_path);

    this.api_key = Cookies.get("api_key");
    this.search_params = Object.fromEntries((new URLSearchParams(window.location.search)).entries());

  }


  get_page_link_element() {
    return this.wait_for_elm(`a[href="?page=${this.page_name}"]`)
  }

  on_correct_page(allow_null = false) {
    if (allow_null && !this.search_params.page) {
      this.get_page_link_element().then((e) => e.addClass("active"))
      return true;
    }

    if (this.search_params.page.startsWith(this.page_name)) {
      this.page_name = this.search_params.page;
      this.get_page_link_element().then((e) => e.addClass("active"))
      return true;
    }


    this.get_page_link_element().then((e) => e.removeClass("active"))
    return false;
  }

  on_page(page) {
    let path = window.location.pathname;
    var p = path.split("/").pop();
    return (page == path || p == page || p.split(".")[0] == page)
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

  wait_for_elm(selector) {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve($(document.querySelector(selector)));
      }

      const observer = new MutationObserver(mutations => {
        if (document.querySelector(selector)) {
          resolve($(document.querySelector(selector)));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  get container() {
    return $("#main-content")
  }

}



module.exports = Page;
