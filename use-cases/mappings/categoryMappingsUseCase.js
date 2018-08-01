const MappingsUseCase = require('./mappingsUseCase.js');

class CategoryMappingsUseCase extends MappingsUseCase {
  constructor(dataProvider, registry) {
    super(dataProvider, registry);
  }

  _checkType(resource) {
    if (resource.schema.type !== 'number' && resource.schema.type !== 'integer') {
      throw Error(
        `Resource ${mapping.resourceID} of Object ${mapping.objectID} is not a number`);
    }
  }

  async applyMapping(id, value) {
    const m = await this.dataProvider.getCategoryMapping(id);
    const ranges = m.ranges;

    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];

      if (value >= r.greaterEqualsThan && value < r.lessThan) {
        return r.label;
      }
    }

    return m.default;
  }
}

module.exports = CategoryMappingsUseCase;
