const EntityNotFoundError = require('../core/entityNotFoundError.js');

class CBlockController {
  constructor(hapiServer, cBlockUseCase, errorRenderer) {
    this.hapiServer = hapiServer;
    this.cBlockUseCase = cBlockUseCase;
    this.errorRenderer = errorRenderer;
  }

  start() {
    this._initRoutes();
  }

  _initRoutes() {
    this.hapiServer.route({
      'method': 'GET',
      'path': '/cblocks/{objectID?}',
      'handler': this._handleGetCBlocks.bind(this),
    });
  }

  async _handleGetCBlocks(request, h) {
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

module.exports = CBlockController;
