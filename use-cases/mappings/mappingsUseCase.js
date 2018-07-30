class MappingsUseCase {
  constructor(dataProvider, registry) {
    this.dataProvider = dataProvider;
    this.registry = registry;
  }

  async getCategoryMapping(id) {
    return await this.dataProvider.getCategoryMapping(id);
  }

  async getCategoryMappings() {
    return await this.dataProvider.getCategoryMappings();
  }

  async putCategoryMapping(id, mapping) {
    await this._checkObjectResourcesAreNumbers(mapping.objectResources);

    return await this.dataProvider.putCategoryMapping(id, mapping);
  }

  async _checkObjectResourcesAreNumbers(objectResources) {
    const promises = mapping.objectResources.map(async (objectResource) => {
        return {
          objectID: objectResource.objectID,
          resource: await this.registry.getResource(
            objectResource.objectID, objectResource.resourceID),
        };
      }
    );

    const resources = await Promise.all(promises);

    for (let i = 0; i < resources.length; i++) {
      const objectID = resources[i].objectID;
      const r = resources[i].resource;

      if (r.schema.type !== 'number' && r.schema.type !== 'integer') {
        throw Error(
          `Resource ${r.resourceID} of Object ${objectID} is not a number`);
      }
    }
  }
}

module.exports = MappingsUseCase;
