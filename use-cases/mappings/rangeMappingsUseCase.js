const MappingsUseCase = require('./mappingsUseCase.js');

class RangeMappingsUseCase extends MappingsUseCase {
  constructor(dataProvider, registry, rangeMap) {
    super(dataProvider, registry);
    this._rangeMap = rangeMap;
  }

  _checkType(resource) {
    if (resource.schema.type !== 'number' && resource.schema.type !== 'integer') {
      throw Error(
        `Resource ${mapping.resourceID} of Object ${mapping.objectID} is not a number`);
    }
  }

  async applyMapping(id, value) {
    const v = parseInt(value, 10);

    const m = await this.dataProvider.getMapping(id);

    return this._rangeMap(
      v,
      m.greaterEqualsThan,
      m.lessEqualsThan);
  }
}

module.exports = RangeMappingsUseCase;
