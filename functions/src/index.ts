import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

// import * as twilio from 'twilio';
// const client = new twilio(accountSid, authToken);
const accountSid = functions.config().twilio.sid;
const videoTokenSid = functions.config().twilio.sid_token_video;
const secret = functions.config().twilio.secret;
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

//Create and request Twilio Access Token
exports.getToken = functions.https.onCall((data:any, res:any) => {
  const identity = data.identity;
  const roomName = data.roomName;

  const token = new AccessToken(accountSid, videoTokenSid, secret, {identity: identity});
  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);

  return { token: token.toJwt()};
});
