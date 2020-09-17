import { Injectable } from '@angular/core';
import {TwilioService} from '../twilio-service.service';

@Injectable({
  providedIn: 'root'
})
export class MicrophoneService {

  constructor(private twilioService: TwilioService) { }


  tryMicrophone(){
    navigator.getUserMedia({audio: true}, () => {
      // webcam is available
      console.log('audio is available')
      this.twilioService.micDeactivate = false;
    }, () => {
      console.log('audio is not available')
      this.twilioService.micDeactivate = true;
      // webcam is not available
    });
  }

  /**
   * Mute your audio in a Room.
   * @param {Room} room - The Room you have joined
   * @returns {void}
   */
  muteYourAudio() {
    this.twilioService.muteOrUnmuteYourMedia('audio', 'mute');
  }
  /**
   * Unmute your audio in a Room.
   * @returns {void}
   */
  unmuteYourAudio() {
    this.twilioService.muteOrUnmuteYourMedia('audio', 'unmute');
  }

  /**
   * A RemoteParticipant muted or unmuted its media.
   * @param {Room} room - The Room you have joined
   * @param {function} onMutedMedia - Called when a RemoteParticipant muted its media
   * @param {function} onUnmutedMedia - Called when a RemoteParticipant unmuted its media
   * @returns {void}
   */
  participantMutedOrUnmutedMedia(room, onMutedMedia, onUnmutedMedia) {
    room.on('trackSubscribed', function(track, publication, participant) {
      track.on('disabled', function() {
        return onMutedMedia(track, participant);
      });
      track.on('enabled', function() {
        return onUnmutedMedia(track, participant);
      });
    });
  }


  // stop only mic
  stopAudioOnly(stream, muted) {
    stream.getTracks().forEach((track) => {
      if (track.readyState == 'live' && track.kind === 'audio') {
        if(muted){
          track.stop();
        }
      }
    });
  }

  // start only mic
  startAudioOnly(stream, muted, container) {
    stream.getTracks().forEach((track) => {
      if (track.readyState == 'live' && track.kind === 'video') {
        if(!muted){
          track.start();
        }
      }
    });
  }

  muteAudioLocal(){
    return navigator.getUserMedia({video: true}, (stream) => {
      // webcam is available
      var container = document.getElementById('local-media');
      return this.stopAudioOnly(stream, true);
    }, () => {
      // webcam is not available
      return null;
    });
  }

  unmuteAudioLocal(){
    return navigator.getUserMedia({video: true}, (stream) => {
      // webcam is available
      var container = document.getElementById('local-media');
      return this.startAudioOnly(stream, true, container);
    }, () => {
      // webcam is not available
      return null;
    });
  }
}
