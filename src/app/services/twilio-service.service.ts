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
  participantVideo: ElementRef;
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
        this.participantConnected(participant);
      });

      room.on('participantDisconnected', (participant) => {
        this.msgSubject.next("Participant '" + participant.identity + "' left the room");
        // console.log("Participant '" + participant.identity + "' left the room");

        this.participantDeconnected(participant);
      });

      room.on('participantConnected',  (participant) => {

        this.participantConnected(participant);

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
        this.localDeconnected(room, room.localParticipant.tracks);
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


  addTrack(track) {
    if (track.kind === 'audio' || track.kind === 'video') {
      let t = document.getElementById('testLocalVideo');
      if(!t.querySelector('video')){
        this.participantVideo.nativeElement.appendChild(track.attach());
      }
    } else if (track.kind === 'data') {
      track.on('message', data => {
        console.log(data);
      });
    }
  }

  removeTracks(track) {
    if (track.kind === 'audio' || track.kind === 'video') {
      track.detach()
      // this.participantVideo.nativeElement.appendChild(track.detach());
    } else if (track.kind === 'data') {
      track.on('message', data => {
        console.log(data);
      });
    }
  }


  participantConnected(participant) {
    participant.tracks.forEach(publication => {
      this.trackPublished(publication, participant);
    });

    console.log('participantConnected :196   ', participant)

    participant.on('trackPublished', publication => {
      this.trackPublished(publication, participant);
    });

    participant.on('trackUnpublished', publication => {
      console.log(`RemoteParticipant ${participant.identity} unpublished a RemoteTrack: ${publication}`);
      this.trackUnpublished(publication, participant);
    });
  }


  localDeconnected(room, localParticipant) {
    console.log('localParticipant : ', localParticipant)
    let localTracks = Array.from(localParticipant.valueOf());
    console.log('localParticipant : ', localTracks)

    localTracks.forEach((track:any) => {
      console.log('track : ', track[1])
      if (track[1].kind !== 'data') {
        let trackConst = track[1];
        console.log('detach() ', trackConst)
        console.log('detach() ', room.localParticipant)
        trackConst.track.stop();

        trackConst.track.detach().forEach(element => element.remove());

        // room.localParticipant.unpublishTrack(trackConst);
        // this.localVideo.nativeElement.appendChild(track[1].track.detach());
      }
    });
  }

  participantDeconnected(participant) {
    participant.tracks.forEach(publication => {
      this.trackUnpublished(publication, participant);
    });

    participant.on('trackUnpublished', publication => {
      console.log(`RemoteParticipant ${participant.identity} unpublished a RemoteTrack: ${publication}`);
      this.trackUnpublished(publication, participant);
    });
  }

  trackPublished(publication, participant) {
    console.log(`RemoteParticipant ${participant.identity} published a RemoteTrack: ${publication}`);

    publication.on('subscribed', track => {
      console.log(`LocalParticipant subscribed to a RemoteTrack: ${track}`);
      this.addTrack(track);
    });

    publication.on('unsubscribed', track => {
      console.log(`LocalParticipant unsubscribed from a RemoteTrack: ${track}`);
      this.removeTracks(track);
    });
  }

  trackUnpublished(publication, participant) {
    console.log(`trackUnpublished ${participant.identity} published a RemoteTrack: ${publication}`);

    publication.on('unsubscribed', track => {
      console.log(`LocalParticipant unsubscribed from a RemoteTrack: ${track}`);
      this.removeTracks(track);
    });
  }

  getTracks(participant) {
    let t = participant.tracks.values();
    console.log('t : ', t)
    let tt:any = Array.from(t)
    console.log('tt : ', tt)
    console.log('tt : ', tt[0])
    console.log('tt : ', tt[0].kind)
    console.log('tt : ', tt[0].track)
    return Array.from(participant.tracks.values()).filter((publication: any) => {
      console.log('getTracks 111 : ', publication.track);
      return publication;
    });
  }

  attachParticipantTracks(participant): void {
    console.log('participant : ', participant)

    var tracks = this.getTracks(participant);
    console.log('tracks : ', tracks)
    console.log('tracks.values() : ', tracks.values())
    this.attachTracks(tracks);
  }

  attachTracks(tracks) {
    console.log('tracks : ', tracks)
    tracks.forEach(track => {
      this.remoteVideo.nativeElement.appendChild(track.attach());
    });
  }

  startLocalVideo(): void {
    Video.createLocalVideoTrack().then(track => {
      console.log('Video.createLocalVideoTrack track : ', track)
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
      track.detach().forEach((detachedElement) => {
        detachedElement.remove();
      });
    });
  }

}
