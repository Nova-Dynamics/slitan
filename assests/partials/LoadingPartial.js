const Partial = require("../../lib/Partial")

// cssify
require('../../css/loading_wheel.css');

/**
 * Represents a partial view that can be rendered into a container and can contain child partials
 * @class Partial
 * @extends EventEmitter
 */
class LoadingPartial extends Partial {

    /**
     * Set the loading state of the partial
     * @method set_loading
     * @param {boolean} loading - True if loading, false otherwise
     */
    set_loading(loading) {

        if (loading)
        {
            this.html.parent().css({"position": "relative"})
            this.html.parent().append(`<div class="loading"><div class="loading-wheel"></div><div class="loading-text"></div></div>`)
        } else {
            this.html.parent().css({"position": "unset"})
            this.html.parent().find(".loading").remove();
        }
    }
}

module.exports = Partial;
