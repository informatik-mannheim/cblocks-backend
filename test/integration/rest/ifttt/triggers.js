// const chai = require('chai');
// const expect = chai.expect;
// const util = require('../../util.js');
// const wire = require('../../../../wire');
// const config = require('config');
// const iftttConfig = config.get('ifttt');
// const examples = require('../../../../rest/controller/ifttt/testExamples.js');
//
// let hapiServer;
// let db;
// let response;
//
// const postNewSensorDataDefaults = {
//   'method': 'GET',
//   'url': '/ifttt/v1/status',
//   'payload': {
//     'trigger_identity': '737ea7ac0bf6b45236002b72e7a6e99a5bf1c1d8',
//     'triggerFields': {
//       'object_id': '3303',
//       'instance_id': '0',
//       'resource_id': '0',
//     },
//     'user': {
//       'timezone': 'America/Los_Angeles',
//     },
//     'ifttt_source': {
//       'id': 'ef60200717723142',
//       'url': 'http://example.com/ef60200717723142',
//     },
//   },
//   'headers': {
//     'ifttt-service-key': iftttConfig['service-key'],
//     'ifttt-channel-key': iftttConfig['service-key'],
//     'Accept': 'application/json',
//     'Accept-Charset': 'utf-8',
//     'Accept-Encoding': 'gzip, deflate',
//   },
// };
//
// describe('REST IFTTT Triggers', () => {
//   before(async () => {
//     const mongoClient = await util.getMongo();
//     const mqttClient = await util.getMQTT();
//     hapiServer = await util.getHapi();
//     db = mongoClient.db('test');
//
//     const app = wire(mongoClient, mqttClient, db, hapiServer, iftttConfig);
//     app.rest.ifttt.triggerRoutes.start();
//   });
//
//   beforeEach(async () => {
//     await util.clearDataBase(db);
//     response = {};
//     payload = {};
//   });
//
//   describe('POST /ifttt/v1/triggers/new_sensor_data', () => {
//     it('should return examples', async () => {
//       await whenRequest(getStatusDefaults);
//
//       statusCodeShouldBe(200);
//       shouldReturn(examples.triggers.readings);
//     });
//   });
// });
//
// async function whenRequest(r) {
//   response = await util.sendRequest(r);
// }
//
// function statusCodeShouldBe(code) {
//   expect(response.raw.statusCode).to.equal(code);
// }
