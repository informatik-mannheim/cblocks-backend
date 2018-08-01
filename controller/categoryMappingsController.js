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
      'path': '/mappings/category/{mappingID}',
      'handler': this._handlePutCategoryMapping.bind(this),
    });

    this.hapiServer.route({
      'method': 'POST',
      'path': '/mappings/category',
      'handler': this._handlePostCategoryMapping.bind(this),
    });

    this.hapiServer.route({
      'method': 'DELETE',
      'path': '/mappings/category/{mappingID}',
      'handler': this._handleDeleteCategoryMapping.bind(this),
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
    if (request.params.mappingID !== undefined) { // TODO test this
      return await this.mappingsUseCase.getCategoryMapping(
        request.params.mappingID);
    }

    return await this.mappingsUseCase.getCategoryMappings();
  }

  async _handlePutCategoryMapping(request, h) {
    this._validatePutCategoryMapping(request.payload);

    try {
      const r = await this.mappingsUseCase.putCategoryMapping(
        request.params.mappingID, request.payload);

      return h.response(r);
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

  async _handlePostCategoryMapping(request, h) {
    this._validatePutCategoryMapping(request.payload);

    try {
      const r = await this.mappingsUseCase.createCategoryMapping(
        request.payload);

      return h.response(r);
    } catch (e) {
      throw this.errorRenderer.boomify(e, {statusCode: 500});
    }
  }

  async _handleDeleteCategoryMapping(request, h) {
    try {
      await this.mappingsUseCase.deleteCategoryMapping(
        request.params.mappingID);

      return h.response('Ok.');
    } catch (e) {
      throw this.errorRenderer.boomify(e, {statusCode: 500});
    }
  }
}

module.exports = MappingsController;
