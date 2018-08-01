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

    this.hapiServer.route({
      'method': 'PATCH',
      'path': '/cblocks/{objectID}/{instanceID}',
      'handler': this._handlePatchInstance.bind(this),
    });
  }

  async _handleGetCBlocks(request, h) {
    try {
      return await this._getCBlocks(request);
    } catch (e) {
      console.log(e);
      throw this.errorRenderer.notFound(e.message);
    }
  }

  async _getCBlocks(request) {
    if (this._requestHasObjectID()) {
      return await
        this.cBlockUseCase.getCBlock(parseInt(request.params.objectID, 10));
    }

    return await this.cBlockUseCase.getCBlocks();
  }

  _requestHasObjectID(request) {
    return request.params.objectID !== undefined;
  }

  async _handlePatchInstance(request, h) {
    try {
      if (this._payloadHasLabel()) {
        await this._setLabel(request);
      }

      return h.response('Ok.');
    } catch (e) {
      let statusCode = 500;

      if (this._isInstanceNotFoundError(e)) {
        statusCode = 404;
      }

      throw this.errorRenderer.boomify(e, {statusCode: statusCode});
    }
  }

  _payloadHasLabel() {
    return request.payload.label !== undefined;
  }

  _isInstanceNotFoundError(e) {
    return (e.message === 'Instance not found.');
  }

  async _setLabel(request) {
    return await this.cBlockUseCase.setInstanceLabel(
      parseInt(request.params.objectID),
      parseInt(request.params.instanceID),
      request.payload.label);
  }
};

module.exports = CBlockController;
