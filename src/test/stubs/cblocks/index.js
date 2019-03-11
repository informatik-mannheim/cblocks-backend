exports.temperature = require('./temperature.js');
exports.led = require('./led.js');
exports.rfid = require('./rfid.js');
exports.scale = require('./scale.js');
exports.button = require('./button.js');
exports.vibration = require('./vibration.js');

exports.all = (() => {
  let result = [];

  result.push(exports.temperature);
  result.push(exports.led);
  result.push(exports.rfid);
  result.push(exports.scale);
  result.push(exports.button);
  result.push(exports.vibration);

  return result;
})();
