module.exports = {
  'objectID': 3302,
  'name': 'Button',
  'resources': {
    '0': {
      'resourceID': 0,
      'name': 'On/Off',
      'is_writeable': true,
      'schema': {
        'type': 'boolean',
        'additionalProperties': false,
      },
    },
    '1': {
      'resourceID': 1,
      'name': 'State',
      'is_writeable': false,
      'schema': {
        'type': 'string',
        'additionalProperties': false,
      },
    },
  },
  'instances': {
    '0': {
        'label': 'Button',
    },
  },
};
