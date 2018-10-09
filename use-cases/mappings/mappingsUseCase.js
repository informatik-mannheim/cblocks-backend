class MappingsUseCase {
  constructor(
    dataProvider, registry, makeOutputMapping, makeInputMapping, makeResource) {
    this.dataProvider = dataProvider;
    this.registry = registry;
    this.makeOutputMapping = makeOutputMapping;
    this.makeInputMapping = makeInputMapping;
    this.makeResource = makeResource;

    this._onUpdateMappings = () => {};
  }

  async getMapping(id) {
    return await this.dataProvider.getMapping(id);
  }

  async getMappings() {
    return await this.dataProvider.getMappings();
  }

  async getMappingsFor(ipso) {
    return await this.dataProvider.getMappingsFor(ipso);
  }

  async deleteMapping(id) {
    return await this.dataProvider.deleteMapping(id);
  }

  async updateMapping(id, mapping) {
    await this._check(mapping);

    const r = await this.dataProvider.updateMapping(id, mapping);

    this._onUpdateMappings();

    return r;
  }

  async _check(mapping) {
    await this.registry.getInstance(mapping.objectID, mapping.instanceID);

    const r = await this.registry.getResource(
      mapping.objectID, mapping.resourceID);

    this._checkType(mapping, r);
  }

  _checkType(mappingDTO, resourceDTO) {
    const map = this.makeOutputMapping(mappingDTO);
    const r = this.makeResource(resourceDTO);

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
