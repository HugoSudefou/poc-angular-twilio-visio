import {ElementRef, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, BehaviorSubject} from 'rxjs';
import * as Video from 'twilio-video';
import {environment} from '../../environments/environment';
import {AngularFireFunctions} from '@angular/fire/functions';


@Injectable()
export class TwilioService {

  remoteVideo: ElementRef;
  localVideo: ElementRef;
  previewing: boolean;
  msgSubject = new BehaviorSubject('');
  roomObj: any;

  roomParticipants;

  constructor(private http: HttpClient, private fns: AngularFireFunctions) {}

  private urlServer = `${environment.urlServer}/`;

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


  connectToRoom(accessToken: string, options): void {

    Video.connect(accessToken, options).then(room => {

      console.log('room : ', room)

      this.roomObj = room;

      if (!this.previewing && options['video']) {
        this.startLocalVideo();
        this.previewing = true;
      }

      room.participants.forEach(participant => {
        this.msgSubject.next("Already in Room: '" + participant.identity + "'");
        // console.log("Already in Room: '" + participant.identity + "'");
        // this.attachParticipantTracks(participant);
      });

      room.on('participantDisconnected', (participant) => {
        this.msgSubject.next("Participant '" + participant.identity + "' left the room");
        // console.log("Participant '" + participant.identity + "' left the room");

        this.detachParticipantTracks(participant);
      });

      room.on('participantConnected',  (participant) => {
        participant.tracks.forEach(track => {
          this.remoteVideo.nativeElement.appendChild(track.attach());
        });

        // participant.on('trackAdded', track => {
        //   console.log('track added')
        //   this.remoteVideo.nativeElement.appendChild(track.attach());
        //   // document.getElementById('remote-media-div').appendChild(track.attach());
        // });
      });

      // When a Participant adds a Track, attach it to the DOM.
      room.on('trackAdded', (track, participant) => {
        console.log(participant.identity + " added track: " + track.kind);
        this.attachTracks([track]);
      });

      // When a Participant removes a Track, detach it from the DOM.
      room.on('trackRemoved', (track, participant) => {
        console.log(participant.identity + " removed track: " + track.kind);
        this.detachTracks([track]);
      });

      room.once('disconnected',  room => {
        this.msgSubject.next('You left the Room:' + room.name);
        console.log('room.localParticipant.tracks : ', room.localParticipant.tracks)
        room.localParticipant.tracks.forEach(track => {
            var attachedElements = track.detach();
            attachedElements.forEach(element => element.remove());
            setTimeout(() => {
              window.location.reload();
            }, 1000)
        });
      });
    });
  }

  /*
  connectToRoom(accessToken: string, options): void {
    Video.connect(accessToken, options).then(room => {
      this.roomObj = room;

      if (!this.previewing && options['video']) {
        this.startLocalVideo();
        this.previewing = true;
      }

      this.roomParticipants = room.participants;
      room.participants.forEach(participant => {
        this.attachParticipantTracks(participant);
      });

      room.on('participantDisconnected', (participant) => {
        this.detachParticipantTracks(participant);
      });

      room.on('participantConnected', (participant) => {
        this.roomParticipants = room.participants;
        this.participantConnected(participant, room);

        // participant.on('trackAdded', track => {
        //   console.log('track added')
        //   this.remoteVideo.nativeElement.appendChild(track.attach());
        //   // document.getElementById('remote-media-div').appendChild(track.attach());
        // });
      });

      // When a Participant adds a Track, attach it to the DOM.
      room.on('trackPublished', (track, participant) => {
        this.attachTracks([track]);
      });

      // When a Participant removes a Track, detach it from the DOM.
      room.on('trackRemoved', (track, participant) => {
        this.detachTracks([track]);
      });

      room.once('disconnected', room => {
        room.localParticipant.tracks.forEach(track => {
          track.track.stop();
          const attachedElements = track.track.detach();
          attachedElements.forEach(element => element.remove());
          room.localParticipant.videoTracks.forEach(video => {
            const trackConst = [video][0].track;
            trackConst.stop();

            trackConst.detach().forEach(element => element.remove());

            room.localParticipant.unpublishTrack(trackConst);
          });



          let element = this.remoteVideo.nativeElement;
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          let localElement = this.localVideo.nativeElement;
          while (localElement.firstChild) {
            localElement.removeChild(localElement.firstChild);
          }
          setTimeout(() => {
            window.location.reload();
          }, 1000)
        });

      });
    }, (error) => {
      alert(error.message);
    });
  }
  */

  attachParticipantTracks(participant): void {
    var tracks = Array.from(participant.tracks.values());
    this.attachTracks([tracks]);
  }

  attachTracks(tracks) {
    tracks.forEach(track => {
      this.remoteVideo.nativeElement.appendChild(track.attach());
    });
  }

  startLocalVideo(): void {
    Video.createLocalVideoTrack().then(track => {
      this.localVideo.nativeElement.appendChild(track.attach());
    });
  }

  localPreview(): void {
    Video.createLocalVideoTrack().then(track => {
      this.localVideo.nativeElement.appendChild(track.attach());
    });
  }

  detachParticipantTracks(participant) {
    var tracks = Array.from(participant.tracks.values());
    this.detachTracks(tracks);
  }

  detachTracks(tracks): void {
    tracks.forEach(function (track) {
      track.detach().forEach(function (detachedElement) {
        detachedElement.remove();
      });
    });
  }

}
