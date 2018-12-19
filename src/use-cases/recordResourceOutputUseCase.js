class RecordResourceOutputUseCase {
  constructor(resourceOutput) {
    this.resourceOutput = resourceOutput;
  }

  record(ipso, value) {
    const timestampMs = Date.now();
    const timestamp = Math.round(timestampMs / 1000);

    return this.resourceOutput.record(ipso, {
      timestamp,
      value,
    });
  }
}

module.exports = RecordResourceOutputUseCase;
