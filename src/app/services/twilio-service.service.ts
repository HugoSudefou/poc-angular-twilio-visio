import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import * as Video from 'twilio-video';
import {AngularFireFunctions} from '@angular/fire/functions';
import {VideoService} from './video/video.service';


@Injectable()
export class TwilioService {

  activeRoom;
  previewTracks;
  identity;
  roomName;
  camDeactivate = false;
  micDeactivate = false;

  constructor(private fns: AngularFireFunctions) {}


  getToken(identity, roomSid): Observable<any> {
    const callable = this.fns.httpsCallable('getToken');
    return callable({ identity: identity, roomSid: roomSid })
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
    var tracks = Array.from(participant.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    this.attachTracks(tracks, container);
  }

  // Detach the Tracks from the DOM.
  detachTracks(tracks) {
    tracks.forEach((track) => {
      if (track) {
        track.detach().forEach((detachedElement) => {
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
        track.detach().forEach((detachedElement) => {
          detachedElement.remove();
        });
      }
    });
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

// Successfully connected!
  roomJoined(room) {
    this.activeRoom = room;

    this.log("Joined as '" + this.identity + "'");

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
      this.log(participant.identity + ' added track: ' + track.kind);
      this.attachTracks([track], participantContainer);
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

  muteOrUnmuteYourLocalMedia(kind, mute) {
    let localTrack = this.previewTracks;
    let track: any = [];
    if((kind === 'audio' && localTrack[0].kind === 'audio') || (kind === 'video' && localTrack[0].kind === 'video')){
      track = localTrack[0]
    } else if((kind === 'audio' && localTrack[1].kind === 'audio') || (kind === 'video' && localTrack[1].kind === 'video')){
      track = localTrack[1]
    }

    if (mute) {
      if(kind === 'video'){
        this.camDeactivate = true;
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

  muteVideoLocal(){
    navigator.getUserMedia({video: true}, (stream) => {
      // webcam is available
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }, () => {
      // webcam is not available
    });
  }


  /**
   * Mute/unmute your media in a Room.
   * @param {'audio'|'video'} kind - The type of media you want to mute/unmute
   * @param {'mute'|'unmute'} action - Whether you want to mute/unmute
   */

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
}
