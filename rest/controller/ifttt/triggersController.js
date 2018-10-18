class Controller {
  constructor(hapiServer, triggersUseCase) {
    this.hapiServer = hapiServer;
    this.useCase = triggersUseCase;
  }

  postNewSensorData(request, h) {
    return {
      'test': 123,
    };
  }
};

module.exports = Controller;
