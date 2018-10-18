class RecordResourceOutputUseCase {
  constructor(resourceOutput) {
    this.resourceOutput = resourceOutput;
  }

  record(ipso, value) {
    return this.resourceOutput.record(ipso, value);
  }
}

module.exports = RecordResourceOutputUseCase;
