module.exports = (serviceKey, makeUuid, request) => {
  return {
    'post': (url, body) => {
      const options = {
        'uri': url,
        'headers': {
          'IFTTT-Service-Key': serviceKey,
          'X-Request-ID': makeUuid(),
        },
        'body': body,
        'json': true,
      };

      return request.post(options);
    },
  };
};
