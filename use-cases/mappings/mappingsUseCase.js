class MappingsUseCase {
  constructor(dataProvider, registry) {
    this.dataProvider = dataProvider;
    this.registry = registry;

    this._onUpdateMappings = () => {};
  }

  async getMapping(id) {
    return await this.dataProvider.getMapping(id);
  }

  async getMappings() {
    return await this.dataProvider.getMappings();
  }

  async deleteMapping(id) {
    return await this.dataProvider.deleteMapping(id);
  }

  async putMapping(id, mapping) {
    await this._check(mapping);

    const r = await this.dataProvider.putMapping(id, mapping);

    this._onUpdateMappings();

    return r;
  }

  async _checkResourceAndInstanceExists(mapping) {
    await this.registry.getInstance(mapping.objectID, mapping.instanceID);

    const r = await this.registry.getResource(
      mapping.objectID, mapping.resourceID);

    this._checkType(r);
  }

  async createMapping(mapping) {
    await this._check(mapping);
    const r = await this.dataProvider.createMapping(mapping);

    this._onUpdateMappings();

    return r;
  }

  registerOnUpdateMappings(cb) {
    this._onUpdateMappings = cb;
  }
}

module.exports = MappingsUseCase;
