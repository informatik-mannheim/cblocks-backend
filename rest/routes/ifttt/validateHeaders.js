module.exports = (serviceKey, renderError) => {
  return (headers) => {
    if (headers['ifttt-channel-key'] !== serviceKey) {
      throw renderError(new Error('Channel key invalid.'), {statusCode: 401});
    }

    if (headers['ifttt-service-key'] !== serviceKey) {
      throw renderError(new Error('Service key invalid.'), {statusCode: 401});
    }

    return headers;
  };
};
