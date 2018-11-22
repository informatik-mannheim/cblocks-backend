module.exports = (triggersDataProvider) => {
  return {
    updateTriggerIdentity: (triggerName, triggerIdentity) => {
      return triggersDataProvider
        .updateTriggerIdentity(triggerName, triggerIdentity);
    },
    getTriggerIdentites: async (triggerName) => {
      const data = await triggersDataProvider
        .getTriggerIdentities(triggerName);

      return data.map((x) => x.triggerIdentity);
    },
    deleteTriggerIdentity: (triggerName, triggerIdentity) => {
      return triggersDataProvider.deleteTriggerIdentity(
        triggerName, triggerIdentity);
    },
  };
};
