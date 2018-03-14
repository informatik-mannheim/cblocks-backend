exports.temperature = require('./temperature.js');
exports.led = require('./led.js');

exports.all = (() => {
  let result = [];

  result.push(exports.temperature);
  result.push(exports.led);

  return result;
})();
