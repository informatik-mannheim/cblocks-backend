module.exports = {
  'type': 'object',
  'properties': {
    'label': {
      'type': 'string',
    },
    'default': {
      'type': 'string',
    },
    'objectID': {
      'type': 'integer',
    },
    'resourceID': {
      'type': 'integer',
    },
    'instanceID': {
      'type': 'integer',
    },
    'ranges': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'label': {
            'type': 'string',
          },
          'greaterEqualsThan': {
            'type': 'number',
          },
          'lessThan': {
            'type': 'number',
          },
        },
        'required': ['label', 'greaterEqualsThan', 'lessThan'],
      },
    },
  },
  'required': ['label', 'objectID', 'resourceID', 'instanceID'],
  'additionalProperties': false,
};
