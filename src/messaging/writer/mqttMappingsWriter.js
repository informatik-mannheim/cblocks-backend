module.exports = (client, util) => {
    const self = {};

    self.write = async (mapping, value) => {
        if (value instanceof Object) {
            value = JSON.stringify(value);
        } else {
            value = String(value);
        }
    
        await client.publish(util.getInternalResourceInputTopic(
            'service', mapping.objectID, mapping.instanceID, mapping.resourceID), JSON.stringify({
            'data': value,
        }));
    }

    return self;
}