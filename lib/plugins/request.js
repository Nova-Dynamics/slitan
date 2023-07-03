
class HTTPCodeError extends Error {
    constructor(code, message, {method, url}={}) {
        super(`${method} ${code}: ${message}`);
        this.code = code;
        this.url = url;
        this.method = method;
    }

    static response(resp, method) {
        return new this(
            resp.status,
            resp.statusText,
            {
                method: method,
                url: resp.url
            }
        );
    }
}

function request(method, url, body=null, headers={}, options={} ) {
    const opts = {
        method: method.toUpperCase(),
        headers,
        ...options
    };

    if ( body != null ) {
        if ( !opts.headers["Content-Type"] ) {
            opts.headers["Content-Type"] = "application/json";
        }
        if ( typeof(body) != "string" ) {
            // TODO : add more stringifying types
            if ( opts.headers["Content-Type"].includes("json") ) {
                opts.body = JSON.stringify(body);
            } else {
                opts.body = body;
            }
        } else {
            opts.body = body;
        }
        opts.headers["Content-Length"] = opts.body.length;
    }

    return fetch(url, opts).then((resp) => {
        if ( !resp.ok ) throw HTTPCodeError.response(resp, method.toUpperCase());

        const content_type = resp.headers.get("Content-Type");
        let content_promise;
        if ( content_type.includes("json") ) {
            content_promise = resp.json();
        } else if ( content_type.includes("form-data") ) {
            content_promise = resp.formData();
        } else {
            // TODO : add more parsing types
            content_promise = resp.text();
        }

        return content_promise.then(data => {
            resp.data = data;
            return resp;
        });
    });
};

module.exports = {
    request,
    GET: function(url, header, options) { return request("GET", url, null, header, options); },
    POST: function(url, body, header, options) { return request("POST", url, body, header, options); },
    PUT: function(url, body, header, options) { return request("PUT", url, body, header, options); },
    PATCH: function(url, body, header, options) { return request("PATCH", url, body, header, options); },
    DELETE: function(url, header, options) { return request("DELETE", url, null, header, options); },
    HTTPCodeError,
}
