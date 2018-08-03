const EntityNotFoundError = require('../../core/entityNotFoundError.js');

class Controller {
  constructor(cBlockUseCase, errorRenderer) {
    this.cBlockUseCase = cBlockUseCase;
    this.errorRenderer = errorRenderer;
  }

  async handleGetCBlocks(request, h) {
    try {
      return await this._getCBlocks(request);
    } catch (e) {
      let statusCode = 500;

      if ( e instanceof EntityNotFoundError) statusCode = 404;

      throw this.errorRenderer.boomify(e, {statusCode: statusCode});
    }
  }

  async _getCBlocks(request) {
    if (this._requestHasObjectID(request)) {
      return await
        this.cBlockUseCase.getCBlock(parseInt(request.params.objectID, 10));
    }

    return await this.cBlockUseCase.getCBlocks();
  }

  _requestHasObjectID(request) {
    return request.params.objectID !== undefined;
  }
};

module.exports = Controller;
