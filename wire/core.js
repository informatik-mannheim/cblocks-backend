module.exports = () => {
  let r = {};
  r.entities = {};

  r.entities.rangeMapping = require('../core/entity/rangeMapping.js');
  r.entities.categoryMapping = require('../core/entity/categoryMapping.js');
  r.entities.labelToValueMapping =
    require('../core/entity/labelToValueMapping.js');
  r.entities.valueToLabelMapping =
    require('../core/entity/valueToLabelMapping.js');
  r.entities.resource = require('../core/entity/resource.js');

  return r;
};
