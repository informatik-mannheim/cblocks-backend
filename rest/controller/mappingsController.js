const EntityNotFoundError = require('../../core/entityNotFoundError.js');

class Controller {
  constructor(mappingsUseCase, errorRenderer, putMappingValidator) {
    this.mappingsUseCase = mappingsUseCase;
    this.errorRenderer = errorRenderer;
    this.putMappingValidator = putMappingValidator;
  }

  async handleGetMappings(request) {
    try {
      return await this._getMappings(request);
    } catch (e) {
      let statusCode = 500;

      if ( e instanceof EntityNotFoundError) statusCode = 404;

      throw this.errorRenderer.boomify(e, {statusCode: statusCode});
    }
  }

  async _getMappings(request) {
    if (request.params.mappingID !== undefined) {
      return await this.mappingsUseCase.getMapping(
        request.params.mappingID);
    }

    return await this.mappingsUseCase.getMappings();
  }


  async handlePostMapping(request, h) {
    this._validateMapping(request.payload);

    try {
      let r;

      if (request.params.mappingID !== undefined) {
        r = await this.mappingsUseCase.updateMapping(
          request.params.mappingID, request.payload);
      } else {
        r = await this.mappingsUseCase.createMapping(
          request.payload);
      }

      return h.response(r);
    } catch (e) {
      let statusCode = 500;

      if ( e instanceof EntityNotFoundError) statusCode = 404;

      throw this.errorRenderer.boomify(e, {statusCode: statusCode});
    }
  }

  _validateMapping(payload) {
    try {
      this.putMappingValidator.validate(payload);
    } catch (e) {
      throw this.errorRenderer.boomify(e, {statusCode: 400});
    }
  }

  async handleDeleteMapping(request, h) {
    try {
      await this.mappingsUseCase.deleteMapping(
        request.params.mappingID);

      const r = h.response();
      r.code(204);

      return r;
    } catch (e) {
      let statusCode = 500;

      if ( e instanceof EntityNotFoundError) statusCode = 404;

      throw this.errorRenderer.boomify(e, {statusCode: statusCode});
    }
  }
}

module.exports = Controller;
