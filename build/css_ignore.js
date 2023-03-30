const through = require('through2');
const path = require('path');

module.exports = function(file, options) {
  const extension = path.extname(file);
  if (extension === '.css') {
    return through();
  }
  
  const stream = through(write, end);
  return stream;

  function write(buf, enc, next) {
    // Replace any "require" calls that reference a CSS file with an empty object literal
    const require_regex = /require\(['"](.+?\.css)['"]\)/g;
    const modified_buf = buf.toString().replace(require_regex, '{}');
    this.push(modified_buf);
    next();
  }

  function end(done) {
    done();
  }
};