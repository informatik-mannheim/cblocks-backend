module.exports = (dataProvider, registry, makeMapping) => {
    const self = {};
    let _onUpdateMappings = () => {};

    self.getMapping = (id) => {
        return dataProvider.getMapping(id);
    }

    self.getMappings = () => {
        return dataProvider.getMappings();
    }

    self.getMappingsFor = (ipso) => {
        return dataProvider.getMappingsFor(ipso);
    }

    self.deleteMapping = (id) => {
        return dataProvider.deleteMapping(id);
    }

    self.updateMapping = async (id, mapping) => {
        await _check(mapping);

        const r = dataProvider.updateMapping(id, mapping);

        _onUpdateMappings();

        return r;
    }

    const _check = async (mapping) => {
        const o = await registry.getObject(mapping.objectID);

        o.getInstance(mapping.instanceID);

        const r = o.getResource(mapping.resourceID);

        _checkType(mapping, r);
    }
    
    const _checkType = async (mappingDTO, resource) => {
        const map = makeMapping(mappingDTO);
    
        if (!map.isApplicableFor(resource)) {
          throw Error('Mapping is not applicable for resource.');
        }
    }

    self.createMapping = async (mapping) => {
        await _check(mapping);
        const r = await dataProvider.createMapping(mapping);
    
        _onUpdateMappings();
    
        return r;
    }

    self.registerOnUpdateMappings = (cb) => {
        _onUpdateMappings = cb;
    }

    return self;
}