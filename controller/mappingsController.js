class MappingsController {
  constructor(hapiServer, mappingsUseCase, errorRenderer, putCategoryMappingValidator) {
    this.hapiServer = hapiServer;
    this.mappingsUseCase = mappingsUseCase;
    this.errorRenderer = errorRenderer;
    this.putCategoryMappingValidator = putCategoryMappingValidator;
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

    this.hapiServer.route({
      'method': 'PUT',
      'path': '/mappings/category/{mappingID?}',
      'handler': this._handlePutCategoryMapping.bind(this),
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

  async _handlePutCategoryMapping(request, h) {
    this._validatePutCategoryMapping(request.payload);

    try {
      await this.mappingsUseCase.putCategoryMapping(
        parseInt(request.params.mappingID, 10), request.payload);

      return h.response('Ok.');
    } catch (e) {
      throw this.errorRenderer.boomify(e, {statusCode: 500});
    }
  }

  _validatePutCategoryMapping(payload) {
    try {
      this.putCategoryMappingValidator.validate(payload);
    } catch (e) {
      throw this.errorRenderer.boomify(e, {statusCode: 400});
    }
  }
}

module.exports = MappingsController;
