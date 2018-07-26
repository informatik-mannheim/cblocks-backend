class MappingsController {
  constructor(hapiServer, mappingsUseCase, errorRenderer) {
    this.hapiServer = hapiServer;
    this.mappingsUseCase = mappingsUseCase;
    this.errorRenderer = errorRenderer;
  }

  start() {
    this._initRoutes();
  }

  _initRoutes() {
    this.hapiServer.route({
      'method': 'GET',
      'path': '/mappings/category/{mappingID?}',
      'handler': this._handleGetCategoryMappings.bind(this),
    });
  }

  async _handleGetCategoryMappings(request) {
    try {
      return await this._getCategoryMappings(request);
    } catch (e) {
      throw this.errorRenderer.notFound(e.message);
    }
  }

  async _getCategoryMappings(request) {
    if (request.params.mappingID !== undefined) {
      return await this.mappingsUseCase.getCategoryMapping(
        parseInt(request.params.mappingID, 10));
    }

    return await this.mappingsUseCase.getCategoryMappings();
  }
}

module.exports = MappingsController;
