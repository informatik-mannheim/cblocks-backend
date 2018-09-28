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
    'labels': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'label': {
            'type': 'string',
          },
        },
        'required': ['value', 'label'],
      },
    },
  },
  'required': ['label', 'default', 'objectID', 'resourceID', 'instanceID', 'labels'],
  'additionalProperties': false,
};
