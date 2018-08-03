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
    'greaterEqualsThan': {
      'type': 'number',
    },
    'lessEqualsThan': {
      'type': 'number',
    },
  },
  'required': ['label', 'objectID', 'resourceID', 'instanceID',
    'greaterEqualsThan', 'lessEqualsThan'],
  'additionalProperties': false,
};
