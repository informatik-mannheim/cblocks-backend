class MappingsUseCase {
  constructor(dataProvider) {
    this.dataProvider = dataProvider;
  }

  async getCategoryMapping(id) {
    return await this.dataProvider.getCategoryMapping(id);
  }

  async getCategoryMappings() {
    return await this.dataProvider.getCategoryMappings();
  }
}

module.exports = MappingsUseCase;
