class MappingsUseCase {
  constructor(
    dataProvider, registry, makeOutputMapping, makeInputMapping) {
    this.dataProvider = dataProvider;
    this.registry = registry;
    this.makeOutputMapping = makeOutputMapping;
    this.makeInputMapping = makeInputMapping;

    this._onUpdateMappings = () => {};
  }

  getMapping(id) {
    return this.dataProvider.getMapping(id);
  }

  getMappings() {
    return this.dataProvider.getMappings();
  }

  getMappingsFor(ipso) {
    return this.dataProvider.getMappingsFor(ipso);
  }

  deleteMapping(id) {
    return this.dataProvider.deleteMapping(id);
  }

  async updateMapping(id, mapping) {
    await this._check(mapping);

    const r = await this.dataProvider.updateMapping(id, mapping);

    this._onUpdateMappings();

    return r;
  }

  async _check(mapping) {
    const o = await this.registry.getObject(mapping.objectID);

    o.getInstance(mapping.instanceID);

    const r = o.getResource(mapping.resourceID);

    this._checkType(mapping, r);
  }

  _checkType(mappingDTO, resource) {
    const map = this.makeOutputMapping(mappingDTO);

    if (!map.isApplicableFor(resource)) {
      throw Error('Mapping is not applicable for resource.');
    }
  }

  async createMapping(mapping) {
    await this._check(mapping);
    const r = await this.dataProvider.createMapping(mapping);

    this._onUpdateMappings();

    return r;
  }

  applyMapping(mapping, value) {
    const map = this.makeOutputMapping(mapping);

    return map.apply(value);
  }

  applyInputMapping(mapping, value) {
    const map = this.makeInputMapping(mapping);

    return map.apply(value);
  }

  registerOnUpdateMappings(cb) {
    this._onUpdateMappings = cb;
  }
}

module.exports = MappingsUseCase;
