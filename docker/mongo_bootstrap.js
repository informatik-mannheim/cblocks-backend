const MongoClient = require('mongodb').MongoClient;
const DB = 'cblocks';
const cblocks = require('../test/stubs/cblocks');
const categoryMappings = require('../test/stubs/categoryMappings');
const rangeMappings = require('../test/stubs/rangeMappings');
const labelMappings = require('../test/stubs/labelMappings');
const mongoHost = process.argv[2] || 'localhost';
const _ = require('lodash');

const collectionNames =
['label-mappings', 'range-mappings', 'category-mappings', 'registry'];

async function bootstrap() {
  let isConnected = false;
  let mongoClient;

  while (!isConnected) {
    try {
      mongoClient = await MongoClient.connect(`mongodb://${mongoHost}:27017`);
      isConnected = true;
    } catch (e) {
    }
  }

  const db = mongoClient.db(DB);

  await collectionNames.map((c) => db.collection(c).drop());

  const insertOne = (collection, item) => db.collection(collection).insertOne(item);

  await cblocks.all.map((c) => insertOne('registry', c));

  await _.forOwn(categoryMappings, (c) => insertOne('category-mappings', c));
  await _.forOwn(rangeMappings, (c) => insertOne('range-mappings', c));
  await _.forOwn(labelMappings, (c) => insertOne('label-mappings', c));
}

bootstrap()
  .then(() => console.log('done'))
  .catch((e) => console.log(e));