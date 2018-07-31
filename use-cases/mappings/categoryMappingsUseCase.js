class MappingsUseCase {
  constructor(dataProvider, registry) {
    this.dataProvider = dataProvider;
    this.registry = registry;

    this._onUpdateMappings = () => {};
  }

  async getCategoryMapping(id) {
    return await this.dataProvider.getCategoryMapping(id);
  }

  async getCategoryMappings() {
    return await this.dataProvider.getCategoryMappings();
  }

  async deleteCategoryMapping(id) {
    return await this.dataProvider.deleteCategoryMapping(id);
  }

  async putCategoryMapping(id, mapping) {
    await this._check(mapping);

    const r = await this.dataProvider.putCategoryMapping(id, mapping);

    this._onUpdateMappings();

    return r;
  }

  async _check(mapping) {
    await this.registry.getInstance(mapping.objectID, mapping.instanceID);

    const r = await this.registry.getResource(
      mapping.objectID, mapping.resourceID);

    if (r.schema.type !== 'number' && r.schema.type !== 'integer') {
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

  registerOnUpdateMappings(cb) {
    this._onUpdateMappings = cb;
  }
}

module.exports = MappingsUseCase;
