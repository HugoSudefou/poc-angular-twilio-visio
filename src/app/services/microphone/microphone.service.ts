import { Injectable } from '@angular/core';
import {TwilioService} from '../twilio-service.service';

@Injectable({
  providedIn: 'root'
})
export class MicrophoneService {

  constructor(private twilioService: TwilioService) { }


  /**
   * Set up the local microphone
   */
  setupMicrophone(){
    navigator.getUserMedia({audio: true}, () => {
      // webcam is available
      this.twilioService.micDeactivate = false;
    }, () => {
      this.twilioService.micDeactivate = true;
      // webcam is not available
    });
  }

  /**
   * Mute your audio in a Room.
   * @returns {void}
   */
  muteYourAudio() {
    this.twilioService.muteOrUnmuteYourRemoteMedia('audio', 'mute');
  }
  /**
   * Unmute your audio in a Room.
   * @returns {void}
   */
  unmuteYourAudio() {
    this.twilioService.muteOrUnmuteYourRemoteMedia('audio', 'unmute');
  }
}
