const through = require('through2');
const fs = require('fs');
const path = require('path');

module.exports = function(file, options) {
  const stream = through(write, end);
  return stream;

  function write(buf, enc, next) {
    const regex = /fs\.readFileSync\(["']\.(\/[^"']+)["']\)/g;
    
    const modified_buf = buf.toString().replace(regex, function(match, filepath) {
      const resolved_filepath = path.resolve(path.join(path.dirname(file), filepath));
      return JSON.stringify(fs.readFileSync(resolved_filepath).toString());
    });
    this.push(modified_buf);
    next();
  }

  function end(done) {
    done();
  }
};