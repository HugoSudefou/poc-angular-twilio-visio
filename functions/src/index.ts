import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

// import * as twilio from 'twilio';
// const client = new twilio(accountSid, authToken);
const accountSid = functions.config().twilio.sid;
const videoTokenSid = functions.config().twilio.sid_token_video;
const authToken = functions.config().twilio.token;
const secret = functions.config().twilio.secret;
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const client = require('twilio')(accountSid, authToken);

// Your cloud function will be like : https://<region>-<appname>.cloudfunctions.net/twilioApp
exports.getToken = functions.https.onCall((data:any, res:any) => {
  // const identity = req.body.data['identity'];
  // const roomName = req.body.data['roomName'];
  const identity = data.identity;
  const roomSid = data.roomSid;

  const token = new AccessToken(accountSid, videoTokenSid, secret, {identity: identity});
  const videoGrant = new VideoGrant({ room: roomSid });
  token.addGrant(videoGrant);
  // console.log('req.body.data[\'identity\'] : ', req.body.data['identity'])
  // console.log('req.body.data[\'identity\'] : ', req.body.data.identity)
  console.log(`issued token for ${identity} in room ${roomSid} token : ${token.toJwt()}`);
  return { token: token.toJwt()};
});



// Create room function
exports.createRoom = functions.https.onRequest((req:any, res:any) => {
  // const identity = req.body.data['identity'];
  // const roomName = req.body.data['roomName'];
  const roomName = 'TestdgfsdroomName';
  console.log('===========================================')
  console.log('body : ', req.body)
  console.log('accountSid : ', accountSid)
  console.log('authToken : ', authToken)
  console.log('secret : ', secret)
  console.log('roomName : ', roomName)
  console.log('===========================================')

  client.video.rooms
    .create({
      uniqueName: roomName
    }).then((nR: any) => {
      console.log('--------------------------------')
      console.log('--------------------------------')
      console.log('roomName : ', roomName)
      console.log('nR : ', nR)
      // console.log('identity : ', data.identity)
      // console.log('req.body.data[\'roomName\'] : ', req.body.data['roomName'])
      console.log('--------------------------------')
      console.log('--------------------------------')
      res.send({data: {nemRoom: nR}}).end();
    })


});

//List Room


// Your cloud function will be like : https://<region>-<appname>.cloudfunctions.net/twilioApp
exports.listRooms = functions.https.onRequest(async (data:any, res:any) => {
  // const identity = req.body.data['identity'];
  // const roomName = req.body.data['roomName'];
  const rooms = await client.video.rooms
    .list({status: 'completed', limit: 20})
    .then((rooms: any) => rooms);

  res.send({data: {rooms: rooms}}).end();
});
