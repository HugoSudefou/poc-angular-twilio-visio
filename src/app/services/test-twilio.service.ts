import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AngularFireFunctions} from '@angular/fire/functions';
import * as Video from 'twilio-video';

@Injectable({
  providedIn: 'root'
})
export class TestTwilioService {

  activeRoom;
  previewTracks;
  identity;
  roomName;
  camDeactivate = false;
  micDeactivate = false;

  constructor(private http: HttpClient, private fns: AngularFireFunctions) { }


  getToken(identity, roomSid): Observable<any> {
    const callable = this.fns.httpsCallable('getToken');
    return callable({ identity: identity, roomSid: roomSid })
  }

  createRoom(roomName){
    const callable = this.fns.httpsCallable('createRoom');
    return callable({ roomName: roomName })
  }

  listRooms(){
    const callable = this.fns.httpsCallable('listRooms');
    return callable({})
  }

// Attach the Tracks to the DOM.
  attachTracks(tracks, container) {
    tracks.forEach((track) => {
      if (track) {
        console.log('track : ', track)
        // track.restart();
        // track.enable();
        container.appendChild(track.attach());
      }
    });
  }

// Attach the Participant's Tracks to the DOM.
  attachParticipantTracks(participant, container) {

    console.log('participant.tracks : ', participant.tracks.values());
    let values = Array.from(participant.tracks.values());
    let t = []
    values.forEach((track: any) => {
      console.log('values : ', track);
      console.log('values.track : ', track.track);
      console.log('values track: ', track['track']);
      t.push(track);
    })
    var tracks = Array.from(participant.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    console.log('t : ', t)

    this.attachTracks(tracks, container);
  }

// Detach the Tracks from the DOM.
  detachTracks(tracks) {
    console.log('tracks : ', tracks)
    tracks.forEach((track) => {
      if (track) {
        track.detach().forEach((detachedElement) => {
          console.log('track detach : ', detachedElement)
          detachedElement.remove();
        });
      }
    });
  }

// Detach the Participant's Tracks from the DOM.
  detachParticipantTracks(participant) {
    var tracks = Array.from(participant.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    tracks.forEach((track) => {
      if (track) {
        console.log('track befor detach')
        track.detach().forEach((detachedElement) => {
          console.log('track detach : ', detachedElement)
          detachedElement.remove();
        });
      }
    });
  }

  gotDevices(mediaDevices) {
    const select = document.getElementById('video-devices');
    select.innerHTML = '';
    select.appendChild(document.createElement('option'));
    let count = 1;
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        const option = document.createElement('option');
        option.value = mediaDevice.deviceId;
        const label = mediaDevice.label || `Camera ${count++}`;
        const textNode = document.createTextNode(label);
        option.appendChild(textNode);
        select.appendChild(option);
      }
    });
  }

//
  stopTracks(tracks) {
    tracks.forEach((track) => {
      if (track) { track.stop(); }
    })
  }

// When we are about to transition away from this page, disconnect
// from the room, if joined.

// Obtain a token from the server in order to connect to the Room.
  connectToRoom(accessToken: string, options, roomName, identity) {

    this.identity = identity;
    document.getElementById('room-controls').style.display = 'block';
      var connectOptions = options;

      console.log('this.previewTracks : ', this.previewTracks)

      if (this.previewTracks) {
        connectOptions.tracks = this.previewTracks;
      }

      // Join the Room with the token from the server and the
      // LocalParticipant's Tracks.
      Video.connect(accessToken, connectOptions).then((r) => this.roomJoined(r), (error) => {
        this.log('Could not connect to Twilio: ' + error.message);
      });
  };

  deconnexion(){
    this.log('Leaving room...');
    this.activeRoom.disconnect();
  }

  updateVideoDevice(event) {
    const select = event.target;
    const localParticipant = this.activeRoom.localParticipant;
    if (select.value !== '') {
      const tracks = Array.from(localParticipant.videoTracks.values()).map(
        (trackPublication:any) => {
          return trackPublication.track;
        }
      );
      localParticipant.unpublishTracks(tracks);
      this.log(localParticipant.identity + ' removed track: ' + tracks[0].kind);
      this.detachTracks(tracks);
      this.stopTracks(tracks);
      Video.createLocalVideoTrack({
        deviceId: { exact: select.value }
      }).then((localVideoTrack) => {
        localParticipant.publishTrack(localVideoTrack);
        this.log(localParticipant.identity + ' added track: ' + localVideoTrack.kind);
        const previewContainer = document.getElementById('local-media');
        this.attachTracks([localVideoTrack], previewContainer);
      });
    }
  }

// Successfully connected!
  roomJoined(room) {
    console.log('room : ', room )
    this.activeRoom = room;

    //
    // navigator.mediaDevices.enumerateDevices().then(this.gotDevices);
    // const select = document.getElementById('video-devices');
    // select.addEventListener('change', this.updateVideoDevice);

    this.log("Joined as '" + this.identity + "'");
    document.getElementById('button-join').style.display = 'none';
    document.getElementById('button-leave').style.display = 'inline';

    // Attach LocalParticipant's Tracks, if not already attached.
    var previewContainer = document.getElementById('local-media');
    var participantContainer = document.getElementById('participant-media');
    if (!previewContainer.querySelector('video') && !this.camDeactivate) {
      console.log('Attach LocalParticipant\'s Tracks, if not already attached.')
      this.attachParticipantTracks(room.localParticipant, previewContainer);
    }

    // Attach the Tracks of the Room's Participants.
    room.participants.forEach((participant) => {
      this.log("Already in Room: '" + participant.identity + "'");
      // this.attachParticipantTracks(participant, participantContainer);
    });

    // When a Participant joins the Room, log the event.
    room.on('participantConnected', (participant) => {
      this.log("Joining: '" + participant.identity + "'");
    });

    // When a Participant adds a Track, attach it to the DOM.
    room.on('trackSubscribed', (track, trackPublication, participant) => {
      console.log('trackSubscribed : ', {track})
      // if((!this.camDeactivate && track.kind === 'video') || (!this.micDeactivate && track.kind === 'audio')){
        console.log('trackSubscribed in : ', {track})
        this.log(participant.identity + ' added track: ' + track.kind);
        this.attachTracks([track], participantContainer);
      // }
    });

    // When a Participant removes a Track, detach it from the DOM.
    room.on('trackUnsubscribed', (track, trackPublication, participant) => {
      this.log(participant.identity + ' removed track: ' + track.kind);
      this.detachTracks([track]);
    });

    // When a Participant leaves the Room, detach its Tracks.
    room.on('participantDisconnected', (participant) => {
      this.log("Participant '" + participant.identity + "' left the room");
      this.detachParticipantTracks(participant);
    });

    // Once the LocalParticipant leaves the room, detach the Tracks
    // of all Participants, including that of the LocalParticipant.
    room.on('disconnected', () => {
      this.log('Left');

      if (this.previewTracks) {
        this.previewTracks.forEach((track) => {
          track.stop();
        });
      }
      this.detachParticipantTracks(room.localParticipant);
      room.participants.forEach(this.detachParticipantTracks);
      this.activeRoom = null;
      document.getElementById('button-join').style.display = 'inline';
      document.getElementById('button-leave').style.display = 'none';
      // select.removeEventListener('change', this.updateVideoDevice);
    });
  }

// Preview LocalParticipant's Tracks.
  localPreview() {
    var localTracksPromise = this.previewTracks
      ? Promise.resolve(this.previewTracks)
      : Video.createLocalTracks();

    localTracksPromise.then(
      (tracks) => {
        this.previewTracks = tracks;
        var previewContainer = document.getElementById('local-media');
        if (!previewContainer.querySelector('video') && !this.camDeactivate) {
          this.attachTracks(tracks, previewContainer);
        }
      },
      (error) => {
        console.error('Unable to access local media', error);
        this.camDeactivate = true;
        this.micDeactivate = true;
        this.log('Unable to access Camera and Microphone');
      }
    );
  }

  unPreviewCam(){
    this.previewTracks = null;
    var previewContainer = document.getElementById('local-media');
    console.log('previewContainer : ', previewContainer);
  }

// Activity log.
  log(message) {
    var logDiv = document.getElementById('log');
    logDiv.innerHTML += '<p>&gt;&nbsp;' + message + '</p>';
    logDiv.scrollTop = logDiv.scrollHeight;
  }

// Leave Room.
  leaveRoomIfJoined() {

    document.getElementById('button-join').style.display = 'inline';
    document.getElementById('button-leave').style.display = 'none';
    if (this.activeRoom) {
      this.activeRoom.disconnect();
    }
  }

  /**
   * Mute your audio in a Room.
   * @param {Room} room - The Room you have joined
   * @returns {void}
   */
  muteYourAudio() {
    this.muteOrUnmuteYourMedia( 'audio', 'mute');
  }

  /**
   * Mute your video in a Room.
   * @param {Room} room - The Room you have joined
   * @returns {void}
   */
  muteYourVideo() {
    this.muteOrUnmuteYourMedia( 'video', 'mute');
  }

  /**
   * Unmute your audio in a Room.
   * @param {Room} room - The Room you have joined
   * @returns {void}
   */
  unmuteYourAudio() {
    this.muteOrUnmuteYourMedia('audio', 'unmute');
  }

  /**
   * Unmute your video in a Room.
   * @param {Room} room - The Room you have joined
   * @returns {void}
   */
  unmuteYourVideo() {
    this.muteOrUnmuteYourMedia('video', 'unmute');
  }

  muteOrUnmuteYourLocalMedia(kind, mute) {
    let localTrack = this.previewTracks;
    let track: any = [];
    if(kind === 'audio' && localTrack[0].kind === 'audio'){
      track = localTrack[0]
    } else if(kind === 'audio' && localTrack[1].kind === 'audio'){
      track = localTrack[1]
    }

    if(kind === 'video' && localTrack[0].kind === 'video'){
      track = localTrack[0]
    } else if(kind === 'video' && localTrack[1].kind === 'video'){
      track = localTrack[1]
    }

    console.log('track : ', track)

    if (mute) {
      if(kind === 'video'){
        this.camDeactivate = true;
      }
      if(kind === 'audio'){
        this.micDeactivate = true;
      }
      navigator.getUserMedia({video: true}, (stream) => {
        // webcam is available
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        console.log('webcam is available')
      }, () => {
        console.log('webcam is not available')
        // webcam is not available
      });
      track.stop();
      track.disable();
    } else {
      if(kind === 'video'){
        this.camDeactivate = false;
      }
      if(kind === 'audio'){
        this.micDeactivate = false;
      }
      track.restart();
      track.enable();
    }
  }

  muteOrUnmuteYourMedia(kind, action) {
    let room = this.activeRoom;
    const publications = kind === 'audio'
      ? room.localParticipant.audioTracks
      : room.localParticipant.videoTracks;

    publications.forEach((publication) => {
      if (action === 'mute') {
        publication.track.stop();
        publication.track.disable();
      } else {
        if((!this.camDeactivate && kind === 'video') || (!this.micDeactivate && kind === 'audio')) {
          publication.track.enable();
          publication.track.restart();
        }
      }
    });
  }

  getHasCam(){
    return !this.camDeactivate;
  }

  getHasMic(){
    return !this.micDeactivate;
  }
}
