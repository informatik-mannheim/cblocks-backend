module.exports = (client, util) => {
    const self = {};

    self.write = async (mapping, data) => {
        await client.publish(util.getInternalResourceInputTopic(
            'service', mapping.objectID, mapping.instanceID, mapping.resourceID), JSON.stringify({data}));
    };

    return self;
};
