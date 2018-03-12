exports.getResourceOutputTopic = function(objectID, instanceID, resourceID){
  return `${objectID}/${instanceID}/${resourceID}/output`
}

//TODO: Tests
exports.getResourceInputTopic = function(clientID, objectID, instanceID, resourceID){
  return `${clientID}/${objectID}/${instanceID}/${resourceID}/input`
}

exports.decomposeResourceOutputTopic = function(topic){
  const regex = /(?:[a-z]*?)\/(.*?)\/(.*?)\/(.*?)\/output/g;

  let matches = regex.exec(topic);

  if(matches){
    return {
      'objectID': parseInt(matches[1]),
      'instanceID': parseInt(matches[2]),
      'resourceID': parseInt(matches[3])
    }
  }

  throw new Error("Invalid resource topic.");
}

exports.decomposeResourceInputTopic = function(topic){
  const regex = /([a-z].+)\/(.*?)\/(.*?)\/(.*?)\/input/g;

  let matches = regex.exec(topic);

  if(matches){
    return {
      'clientID': matches[1],
      'objectID': parseInt(matches[2]),
      'instanceID': parseInt(matches[3]),
      'resourceID': parseInt(matches[4])
    }
  }

  throw new Error("Invalid resource topic.");
}

exports.getClientIDInResponseTopic = function(topic){
  const regex = /(.+)\/responses/g;

  let matches = regex.exec(topic);

  if(matches){
    return matches[1]
  }

  throw new Error("Invalid response topic.");
}

exports.getPublishErrorTopic = function(objectID, instanceID, resourceID){
  return exports.getResourceOutputTopic(objectID, instanceID, resourceID) + "/errors"
}

exports.getWriteResponseTopic = function(clientID){
  return `${clientID}/responses`
}
