// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  urlServer: 'https://us-central1-poc-angular-twilio-visio.cloudfunctions.net/twilioApp',
  firebase: {
    apiKey: 'AIzaSyAyT5MjUVEriXXssBtSnwBCzAXIiJnlovk',
    authDomain: 'poc-angular-twilio-visio.firebaseapp.com',
    databaseURL: 'https://poc-angular-twilio-visio.firebaseio.com',
    projectId: 'poc-angular-twilio-visio',
    storageBucket: 'poc-angular-twilio-visio.appspot.com',
    messagingSenderId: '622393072122',
    appId: '1:622393072122:web:43606035e62b1d5f69ac43',
    measurementId: 'G-3ZXK06HTPZ'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
