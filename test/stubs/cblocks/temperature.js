module.exports = {
  'objectID': 3303,
  'name': 'Temperature Sensor',
  'resources': {
    '0': {
      'resourceID': 0,
      'name': 'Current Temperature',
      'is_writeable': false,
      'unit': '°',
      'schema': {
        'type': 'number',
        'additionalProperties': false,
      },
    },
    '1': {
      'resourceID': 1,
      'name': 'Relative Humidity',
      'is_writeable': false,
      'unit': '%',
      'schema': {
        'type': 'number',
        'additionalProperties': false,
      },
    },
  },
  'instances': {
    '0': {
        'label': 'Temperature Sensor',
    },
  },
};
