const validateHeaders = (headers, serviceKey) => {
  if (headers['ifttt-channel-key'] !== serviceKey) {
    throw Error('Channel key invalid.');
  }

  if (headers['ifttt-service-key'] !== serviceKey) {
    throw Error('Service key invalid.');
  }
};

exports.validateHeaders = validateHeaders;

exports.makeHandler = (serviceKey, errorRenderer) => {
  return (request) => {
    try {
      validateHeaders(request.headers, serviceKey);
    } catch (e) {
      throw errorRenderer.boomify(e, {statusCode: 401});
    }
  };
};
