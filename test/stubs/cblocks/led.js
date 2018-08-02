module.exports = {
  'objectID': 3304,
  'name': 'LED Stripe',
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
      'name': 'Color',
      'is_writeable': true,
      'schema': {
        'properties': {
          'red': {
            'type': 'number',
            'minimum': 0,
            'maximum': 255,
          },
          'green': {
            'type': 'number',
             'minimum': 0,
              'maximum': 255,
          },
          'blue': {
            'type':
            'number',
            'minimum': 0,
            'maximum': 255,
          },
        },
        'additionalProperties': false,
      },
    },
  },
};
