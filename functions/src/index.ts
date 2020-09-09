

// @ts-ignore
// const client = new twilio(accountSid, authToken);
//
//
// // // Start writing Firebase Functions
// // // https://firebase.google.com/docs/functions/typescript
// //
// // export const helloWorld = functions.https.onRequest((request, response) => {
// //   functions.logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });
//
// exports.textStatus = functions.database
//   .ref('/tests/{idTests}/name')
//   .onUpdate((event,context) => {
//
//
//     const idTests = context.params.idTests
//
//     console.log('-----------------------------------------');
//     console.log(idTests);
//     console.log(':::::::::::::::::::::::::::::::::::::::::');
//     console.log(event);
//     console.log('.........................................');
//     console.log(context);
//     console.log('=========================================');
//
//
//     return admin.database()
//       .ref(`/tests/${idTests}`)
//       .once('value')
//       .then(snapshot => snapshot.val())
//       .then(order => {
//         console.log('order : ', order);
//         return 'test return firebase function';
//       })
//       .then(message => console.log(message, 'success'))
//       .catch(err => console.log(err))
//   });

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

// import * as twilio from 'twilio';
// const client = new twilio(accountSid, authToken);
const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const secret = functions.config().twilio.secret;
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const client = require('twilio')(accountSid, authToken);

// Your cloud function will be like : https://<region>-<appname>.cloudfunctions.net/twilioApp
exports.getToken = functions.https.onCall((data, res) => {
  // const identity = req.body.data['identity'];
  // const roomName = req.body.data['roomName'];
  const identity = data.identity;
  const roomSid = data.roomSid;


  console.log('--------------------------------')
  console.log('--------------------------------')
  console.log('data : ', data)
  console.log({identity})
  console.log({roomSid})
  console.log('--------------------------------')
  console.log('--------------------------------')

  const token = new AccessToken(accountSid, authToken, secret, {identity: identity});
  const videoGrant = new VideoGrant({ room: roomSid });
  token.addGrant(videoGrant);
  // console.log('req.body.data[\'identity\'] : ', req.body.data['identity'])
  // console.log('req.body.data[\'identity\'] : ', req.body.data.identity)
  console.log(`issued token for ${identity} in room ${roomSid} token : ${token.toJwt()}`);
  return { token: token.toJwt()};
});



// Create room function
exports.createRoom = functions.https.onCall(async (data, res) => {
  // const identity = req.body.data['identity'];
  // const roomName = req.body.data['roomName'];
  console.log('===========================================')
  console.log('data : ', data)
  console.log('accountSid : ', accountSid)
  console.log('authToken : ', authToken)
  console.log('secret : ', secret)
  console.log('===========================================')
  const roomName = 'DailyStandup';

  const nemRoom = await client.video.rooms
    .create({
      uniqueName: roomName
    }).then((data: any) => data)

  console.log('--------------------------------')
  console.log('--------------------------------')
  console.log('data : ', data)
  console.log('roomName : ', roomName)
  console.log('nemRoom : ', nemRoom)
  // console.log('identity : ', data.identity)
  // console.log('req.body.data[\'roomName\'] : ', req.body.data['roomName'])
  console.log('--------------------------------')
  console.log('--------------------------------')

  return {nemRoom: nemRoom};
});

//List Room


// Your cloud function will be like : https://<region>-<appname>.cloudfunctions.net/twilioApp
exports.listRooms = functions.https.onRequest(async (data, res) => {
  // const identity = req.body.data['identity'];
  // const roomName = req.body.data['roomName'];
  const rooms = await client.video.rooms
    .list({status: 'completed', limit: 20})
    .then((rooms: any) => rooms);

  res.send({data: {rooms: rooms}}).end();
});
