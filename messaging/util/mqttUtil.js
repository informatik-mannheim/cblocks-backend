exports.getResourceOutputTopic = function(objectID, instanceID, resourceID) {
  return `${objectID}/${instanceID}/${resourceID}/output`;
};

exports.getInternalResourceInputTopic = function(
  clientID, objectID, instanceID, resourceID) {
    return `internal/${clientID}/${objectID}/${instanceID}/${resourceID}/input`;
};

exports.decomposeResourceOutputTopic = function(topic) {
  const regex = /(?:[a-z]*\/){0,1}([0-9]+)\/([0-9]+)\/([0-9]+)\/output/g;

  const matches = regex.exec(topic);

  if (matches) {
    return {
      'objectID': parseInt(matches[1]),
      'instanceID': parseInt(matches[2]),
      'resourceID': parseInt(matches[3]),
    };
  }

  throw new Error('Invalid resource topic.');
};

exports.decomposeResourceInputTopic = function(topic) {
  const regex = /([a-z].+)\/(.*?)\/(.*?)\/(.*?)\/input/g;

  const matches = regex.exec(topic);

  if (matches) {
    return {
      'clientID': matches[1],
      'objectID': parseInt(matches[2]),
      'instanceID': parseInt(matches[3]),
      'resourceID': parseInt(matches[4]),
    };
  }

  throw new Error('Invalid resource topic.');
};

exports.isResponseTopic = function(topic) {
  const regex = /([a-z].+)\/responses/g;

  const matches = regex.exec(topic);

  if (matches) return true;

  return false;
};

exports.isInputTopic = (topic) => {
  const regex = /(.+)\/([0-9]+)\/([0-9]+)\/([0-9]+)\/input/g;

  const matches = regex.exec(topic);

  if (matches) return true;

  return false;
};

exports.isOutputTopic = (topic) => {
  const regex = /([0-9]+)\/([0-9]+)\/([0-9]+)\/output/g;

  const matches = regex.exec(topic);

  if (matches) return true;

  return false;
};

exports.getClientIDInResponseTopic = function(topic) {
  if (exports.isResponseTopic(topic)) {
    const regex = /([a-z].+)\/responses/g;

    return regex.exec(topic)[1];
  }

  throw new Error('Invalid response topic.');
};

exports.getPublishErrorTopic = function(objectID, instanceID, resourceID) {
  return exports.getResourceOutputTopic(objectID, instanceID, resourceID)
    + '/errors';
};

exports.getWriteResponseTopic = function(clientID) {
  return `${clientID}/responses`;
};
