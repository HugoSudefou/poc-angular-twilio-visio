

// @ts-ignore
// const client = new twilio(acounctSid, authToken);
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
// const client = new twilio(acounctSid, authToken);

const acounctSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const secret = functions.config().twilio.secret;

const express = require('express');
const app = express();
const path = require('path');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const router = express.Router();

app.use(express.static(path.join(__dirname, 'build')));

// @ts-ignore
router.get('/token', (req, res) => {
  const identity = 'test';
  const roomName = 'test';

  console.log('99999999999999999999999999999999999999999');
  console.log({acounctSid});
  console.log({authToken});
  console.log({secret});
  console.log('99999999999999999999999999999999999999999');
  const token = new AccessToken(acounctSid, authToken, secret);
  token.options.identity = identity;

  console.log('-----------------------------------------');
  console.log(req.query);
  console.log('=========================================');
  console.log(identity);
  console.log('-=-==-==-=-=-=-=-=-==--==-=-=-=-==-=-==-=');
  console.log(token);
  console.log(':::::::::::::::::::::::::::::::::::::::::');
  console.log(token.options);
  console.log('+-*+-*+-+-*+-*+-*+-*+-*-+*-++-+-*+-*-+-*-*');
  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);
  res.send(token.toJwt());
  console.log(`issued token for ${identity} in room ${roomName}`);
});

// Your cloud function will be like : https://<region>-<appname>.cloudfunctions.net/twilioApp
exports.twilioApp = functions.https.onRequest(router);


//
// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// admin.initializeApp(functions.config().firebase);
//
// // import * as twilio from 'twilio';
// // const client = new twilio(acounctSid, authToken);
//
// const acounctSid = functions.config().twilio.sid;
// const authToken = functions.config().twilio.token;
// const secret = functions.config().twilio.secret;
//
// // const express = require('express');
// // const app = express();
// // const path = require('path');
// const AccessToken = require('twilio').jwt.AccessToken;
// const VideoGrant = AccessToken.VideoGrant;
// // const router = express.Router();
// const express = require('express');
// const cors = require('cors');
//
// const app = express();
//
// // Automatically allow cross-origin requests
// app.use(cors({ origin: true }));
// // app.use(express.static(path.join(__dirname, 'build')));
//
// // @ts-ignore
// app.get('/token', (req, res) => {
//   const identity = 'test';
//   const roomName = 'test';
//   console.log('ppppppppppppppppppppppppppp')
//   console.log({acounctSid});
//   console.log({ authToken});
//   console.log({ secret});
//   console.log('ppppppppppppppppppppppppppp')
//
//   const token = new AccessToken(acounctSid, authToken, secret, {
//     identity: identity
//   });
//   console.log('-----------------------------------------');
//   console.log(req.query);
//   console.log('=========================================');
//   console.log(identity);
//   console.log('/////////////////////////////////////////');
//   console.log(token);
//   console.log('+-*+-*+-+-*+-*+-*+-*+-*-+*-++-+-*+-*-+-*-*');
//   const videoGrant = new VideoGrant({ room: roomName });
//   token.addGrant(videoGrant);
//   res.send(token.toJwt());
//   console.log(`issued token for ${identity} in room ${roomName}`);
// });
//
// // Your cloud function will be like : https://<region>-<appname>.cloudfunctions.net/twilioApp
// exports.twilioApp = functions.https.onRequest(app);
