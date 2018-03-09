exports.getResourceOutputTopic = function(objectID, instanceID, resourceID){
  return `${objectID}/${instanceID}/${resourceID}/output`
}

exports.decomposeResourceTopic = function(topic){
  const regex = /(?:[a-z]*?)\/(.*?)\/(.*?)\/(.*?)\/(?:output|input)/g;

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

exports.getPublishErrorTopic = function(objectID, instanceID, resourceID){
  return exports.getResourceOutputTopic(objectID, instanceID, resourceID) + "/errors"
}
