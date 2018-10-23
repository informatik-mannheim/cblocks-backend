module.exports = (serviceKey, ErrorRenderer) => {
  return (headers) => {
    if (headers['ifttt-channel-key'] !== serviceKey) {
      throw new ErrorRenderer('Channel key invalid.', {statusCode: 401});
    }

    if (headers['ifttt-service-key'] !== serviceKey) {
      throw new ErrorRenderer('Service key invalid.', {statusCode: 401});
    }

    return headers;
  };
};
