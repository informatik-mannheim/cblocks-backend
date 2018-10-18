class RecordResourceOutputUseCase {
  constructor(resourceOutput) {
    this.resourceOutput = resourceOutput;
  }

  record(ipso, value) {
    const timestamp = Date.now();

    return this.resourceOutput.record(ipso, {
      timestamp,
      value,
    });
  }
}

module.exports = RecordResourceOutputUseCase;
