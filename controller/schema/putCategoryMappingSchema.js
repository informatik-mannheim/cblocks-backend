module.exports = {
  'type': 'object',
  'properties': {
    'label': {
      'type': 'string',
    },
    'default': {
      'type': 'string',
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
    'objectResources': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'objectID': {
            'type': 'integer',
          },
          'resourceID': {
            'type': 'integer',
          },
        },
        'required': ['objectID', 'resourceID'],
      },
    },
  },
  'required': ['label', 'objectResources'],
  'additionalProperties': false,
};
