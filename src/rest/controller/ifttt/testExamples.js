const ledSamples = {
  'off': JSON.stringify({
      'red': 0,
      'green': 0,
      'blue': 0,
    }),
  'on': JSON.stringify({
    'red': 255,
    'green': 255,
    'blue': 255,
  })
}

exports.triggers = {
  'samples': {
    'new_sensor_data': {
      'object_id': 3303,
      'instance_id': 0,
      'resource_id': 0,
    },
    'new_category_mappings': {
      'to': 'Medium',
    },
    'new_label_mappings': {
      'to': 'On'
    }
  },
  'data': {
    'new_sensor_data': [25, 26, 25.5, 28, 30, 29],
    'new_category_mappings': [18, 35, 25.5, 28, 31, 29],
    'new_label_mappings': [ledSamples.on, ledSamples.on, ledSamples.off, ledSamples.on, ledSamples.off, ledSamples.off],
  },
};

exports.actions = {
  'samples': {
    'label_mappings': {
      'from': 'Off'
    }
  }
}