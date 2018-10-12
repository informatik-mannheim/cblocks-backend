const MongoClient = require('mongodb').MongoClient;
const DB = 'cblocks';
const cblocks = require('./data/cblocks');
const categoryMappings = require('./data/categoryMappings');
const rangeMappings = require('./data/rangeMappings');
const labelMappings = require('./data/labelMappings');
const _ = require('lodash');

const collectionNames =
['label-mappings', 'range-mappings', 'category-mappings', 'registry'];

async function bootstrap() {
  let isConnected = false;
  let mongoClient;

  while (!isConnected) {
    try {
      mongoClient = await MongoClient.connect('mongodb://mongo:27017');
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
