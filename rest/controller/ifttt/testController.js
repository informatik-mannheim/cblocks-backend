const examples = require('./testExamples.js');

class Controller {
  postTestSetup(request, h) {
    return {
      'data': {
        'samples': {
          'triggers': examples.triggers,
        },
      },
    };
  }
};

module.exports = Controller;
