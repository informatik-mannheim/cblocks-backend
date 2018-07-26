module.exports = {
  'mappingID': 4711,
  'label': 'Temperature Category Mapping',
  'default': 'High',
  'ranges': [
    {
      'label': 'Low',
      'greaterEqualsThan': -10,
      'lessThan': 20,
    },
    {
      'label': 'Medium',
      'greaterEqualsThan': 20,
      'lessThan': 30,
    },
  ],
};
