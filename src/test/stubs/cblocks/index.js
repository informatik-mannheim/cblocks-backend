exports.temperature = require('./temperature.js');
exports.led = require('./led.js');
exports.rfid = require('./rfid.js');
exports.scale = require('./scale.js');

exports.all = (() => {
  let result = [];

  result.push(exports.temperature);
  result.push(exports.led);
  result.push(exports.rfid);
  result.push(exports.scale);

  return result;
})();
