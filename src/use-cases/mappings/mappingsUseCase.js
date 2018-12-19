class MappingsUseCase {
  constructor(
    dataProvider, registry, outputDataProvider, makeOutputMapping, makeInputMapping) {
    this.dataProvider = dataProvider;
    this.registry = registry;
    this.outputDataProvider = outputDataProvider;
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

  async applyMapping(mapping, value) {
    const map = this.makeOutputMapping(mapping);
    const output = map.apply(value);

    await this.recordOutputMapping(mapping.mappingID, value, output);

    return output;
  }

  applyInputMapping(mapping, value) {
    const map = this.makeInputMapping(mapping);

    return map.apply(value);
  }

  async recordOutputMapping(mappingID, from, to) {
    const timestampMs = Date.now();
    const timestamp = Math.round(timestampMs / 1000);
    const createdAt = new Date(timestampMs).toISOString();

    await this.outputDataProvider.record(mappingID, from, to, timestamp, createdAt);
  }

  registerOnUpdateMappings(cb) {
    this._onUpdateMappings = cb;
  }
}

module.exports = MappingsUseCase;
