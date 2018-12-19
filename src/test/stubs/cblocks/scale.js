module.exports = {
  'objectID': 3306,
  'name': 'Scale',
  'resources': {
    '0': {
      'resourceID': 0,
      'name': 'Weight',
      'is_writeable': false,
      'unit': 'grams',
      'schema': {
        'type': 'number',
        'minimum': -500,
        'maximum': 500,
        'additionalProperties': false,
      },
    },
  },
  'instances': {
    '0': {
        'label': 'Scale',
    },
  },
};
