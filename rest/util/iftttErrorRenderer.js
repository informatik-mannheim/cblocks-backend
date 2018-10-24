module.exports = (renderError) => {
  return (e, options) => {
    const error = renderError(e, options);

    let iftttError = Object.create(error);

    iftttError.output.payload.errors = [{
      'message': error.output.payload.message,
    }];

    delete iftttError.output.payload.error;
    delete iftttError.output.payload.message;

    return iftttError;
  };
};
