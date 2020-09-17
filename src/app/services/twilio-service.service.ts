import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import * as Video from 'twilio-video';
import {AngularFireFunctions} from '@angular/fire/functions';
import {MicrophoneService} from './microphone/microphone.service';
import {Router} from '@angular/router';


@Injectable()
export class TwilioService {

  activeRoom;
  previewTracks;
  identity;
  roomName;
  camDeactivate = false;
  micDeactivate = false;

  constructor(private fns: AngularFireFunctions,
              private route: Router) {}

  /**
   * Get the token from firebase cloud function the connect user to twilio room
   * @param identity - string - name/id of the user to create the token for connection to the twilio room
   * @param roomName - string - Nome of the room
   */
  getToken(identity, roomName): Observable<any> {
    const callable = this.fns.httpsCallable('getToken');
    return callable({ identity: identity, roomName: roomName });
  }

  /**
   * Attach the Tracks to the DOM.
   * @param tracks - track to attach in the container
   * @param container - container from DOM to attach the track
   * @param nameClass - name of class for DOM
   */
  attachTracks(tracks, container, nameClass) {
    tracks.forEach((track) => {
      if (track) {
        let newNameClass = nameClass;
        if(track.kind === 'audio'){
          newNameClass += 'Audio'
        } else {
          newNameClass += 'Video'
        }
        container.appendChild(track.attach()).className = newNameClass;
      }
    });
  }

  /**
   * Attach the Participant's Tracks to the DOM.
   * @param participant - participant to attach in the container
   * @param container - container of participant in DOM
   * @param nameClass - name of class for DOM
   */
  attachParticipantTracks(participant, container, nameClass) {
    var tracks = Array.from(participant.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    this.attachTracks(tracks, container, nameClass);
  }

  //
  /**
   *  etach the Tracks from the DOM.
   * @param tracks - track to detach of the DOM
   */
  detachTracks(tracks) {
    tracks.forEach((track) => {
      if (track) {
        track.detach().forEach((detachedElement) => {
          detachedElement.remove();
        });
      }
    });
  }

  /**
   * Detach the Participant's Tracks from the DOM.
   * @param participant - participant to detach track of the DOM
   */
  detachParticipantTracks(participant) {
    var tracks = Array.from(participant.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    this.detachTracks(tracks);
  }

  /**
   * Connection to twilio with the access token and option of connection
   * @param accessToken - string - access Token for twilio
   * @param options - object - option of connection for twilio
   * @param roomName - string - Nome of the room
   * @param identity - name/id of user want to connect
   */
  connectToRoom(accessToken: string, options, roomName, identity) {

    this.identity = identity;
    var connectOptions = options;
    if (this.previewTracks) {
      connectOptions.tracks = this.previewTracks;
    }

    Video.connect(accessToken, connectOptions).then((r) => this.roomJoined(r), (error) => {
      this.log('Could not connect to Twilio: ' + error.message);
    });
  }

  /**
   * When successfully connected to room.
   * @param room - room twilio where we are connected
   */
  roomJoined(room) {
    //save activeRoom
    this.activeRoom = room;

    this.log("Joined as '" + this.identity + "'");

    //Get container for local and participant media
    var previewContainer = document.getElementById('local-media');
    var participantContainer = document.getElementById('participant-media');

    // Attach LocalParticipant's Tracks, if not already attached.
    if (!previewContainer.querySelector('video') && !this.camDeactivate) {
      this.attachParticipantTracks(room.localParticipant, previewContainer, 'previewContainer');
    }

    this.setUpRoomEvent(room, previewContainer, participantContainer);
  }

  /**
   * SetUp all event of the Room went we are connected
   * @param room - Room connected
   * @param previewContainer - container for local media
   * @param participantContainer - container for participant media
   */
  setUpRoomEvent(room, previewContainer, participantContainer){

    // When a Participant joins the Room, log the event.
    room.on('participantConnected', (participant) => {
      this.log("Joining: '" + participant.identity + "'");
    });

    // When a Participant adds a Track, attach it to the DOM.
    room.on('trackSubscribed', (track, trackPublication, participant) => {
      this.log(participant.identity + ' added track: ' + track.kind);
      this.attachTracks([track], participantContainer, 'participantContainer');
    });

    // When a Participant removes a Track, detach it from the DOM.
    room.on('trackUnsubscribed', (track, trackPublication, participant) => {
      this.log(participant.identity + ' removed track: ' + track.kind);
      this.detachTracks([track]);
    });

    // When a Participant leaves the Room, detach its Tracks.
    room.on('participantDisconnected', (participant) => {
      this.log("Participant '" + participant.identity + "' left the room");
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
      this.activeRoom = null;
     });
  }

  /**
   * Create LocalParticipant's Tracks and send it Twilio;
   */
  createLocalPreview() {
    //get local track if here or recreate local track for twilio
    var localTracksPromise = this.previewTracks
      ? Promise.resolve(this.previewTracks)
      : Video.createLocalTracks();

    localTracksPromise.then(
      (tracks) => {
        this.previewTracks = tracks;
        var previewContainer = document.getElementById('local-media');
        if (!previewContainer.querySelector('video') && !this.camDeactivate) {
          this.attachTracks(tracks, previewContainer, 'previewContainer');
        }
      },
      () => {
        this.camDeactivate = true;
        this.micDeactivate = true;
        this.log('Unable to access Camera and Microphone');
      }
    );
  }


  /**
   * Activity log.
   * @param message - string - message to print
   */
  log(message) {
    var logDiv = document.getElementById('log');
    logDiv.innerHTML += '<p>&gt;&nbsp;' + message + '</p>';
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  /**
   * Leave Room if activeRoom
   */
  leaveRoomIfJoined() {
    if (this.activeRoom) {
      this.activeRoom.disconnect();
      this.route.navigateByUrl(`/`)
    }
  }

  /**
   * Mute/unmute your local media.
   * @param kind - The type of media you want to mute/unmute
   * @param mute - bool - mute/unmute
   */
  muteOrUnmuteYourLocalMediaPreview(kind: string, mute: boolean) {
    //get local track
    let localTrack = this.previewTracks;

    let track: any = [];
    //get audio or video track
    if(kind === localTrack[0].kind){
      track = localTrack[0]
    } else {
      track = localTrack[1]
    }

    if (mute) {
      if(kind === 'video'){
        this.camDeactivate = true;
        //stop webcam
        this.muteVideoLocal();
      }
      if(kind === 'audio'){
        this.micDeactivate = true;
      }
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

  /**
   *
   */
  muteVideoLocal(){
    navigator.getUserMedia({video: true}, (stream) => {
      // webcam is available
      stream.getTracks().forEach((track) => {
        //stop webcam
        track.stop();
      });
    }, () => {
      // webcam is not available
    });
  }


  /**
   * Mute/unmute your media of the Room.
   * @param {'audio'|'video'} kind - The type of media you want to mute/unmute
   * @param {'mute'|'unmute'} action - Whether you want to mute/unmute
   */

  muteOrUnmuteYourRemoteMedia(kind, action) {
    //get active room
    let room = this.activeRoom;

    //get local track
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
}
