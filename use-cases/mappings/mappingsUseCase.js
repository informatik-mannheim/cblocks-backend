class MappingsUseCase {
  constructor(dataProvider, registry, makeMapping, makeResource) {
    this.dataProvider = dataProvider;
    this.registry = registry;
    this.makeMapping = makeMapping;
    this.makeResource = makeResource;

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

  async _check(mapping) {
    await this.registry.getInstance(mapping.objectID, mapping.instanceID);

    const r = await this.registry.getResource(
      mapping.objectID, mapping.resourceID);

    this._checkType(mapping, r);
  }

  _checkType(mapping, resource) {
    const map = this.makeMapping(mapping);
    const r = this.makeResource(resource);

    if (!map.isApplicableFor(r)) {
      throw Error('Mapping is not applicable for resource.');
    }
  }

  async createMapping(mapping) {
    await this._check(mapping);
    const r = await this.dataProvider.createMapping(mapping);

    this._onUpdateMappings();

    return r;
  }

  applyMapping(value) {
    const map = this.makeMapping(mapping);
    map.apply(value);
  }

  registerOnUpdateMappings(cb) {
    this._onUpdateMappings = cb;
  }
}

module.exports = MappingsUseCase;
