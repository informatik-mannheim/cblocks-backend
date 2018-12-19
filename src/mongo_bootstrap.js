const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const DB = 'cblocks';
const cblocks = require('./test/stubs/cblocks');
const categoryMappings = require('./test/stubs/categoryMappings');
const rangeMappings = require('./test/stubs/rangeMappings');
const labelMappings = require('./test/stubs/labelMappings');
const _ = require('lodash');

const collectionNames =
['label-mappings', 'range-mappings', 'category-mappings', 'registry'];

async function bootstrap() {
  const mongoClient = await MongoClient.connect('mongodb://mongo:27017');
  const db = mongoClient.db(DB);

  await Promise.all(collectionNames.map((c) => db.collection(c).deleteMany()));


  const insertOne = (collection, item) => db.collection(collection).insertOne(item);
  const insertMapping = (collection, item) => {
    delete item.mappingID;
    return insertOne(collection, item);
  };

  await Promise.all(_.map(cblocks.all, (c) => insertOne('registry', c)));
  await Promise.all(_.map(categoryMappings, (c) => insertMapping('category-mappings', c)));
  await Promise.all(_.map(rangeMappings, (c) => insertMapping('range-mappings', c)));
  await Promise.all(_.map(labelMappings, (c) => insertMapping('label-mappings', c)));
}

bootstrap()
  .then(() => console.log('done'))
  .then(() => process.exit(1))
  .catch((e) => console.log(e));
