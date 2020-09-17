import { Injectable } from '@angular/core';
import {TwilioService} from '../twilio-service.service';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private twilioService: TwilioService) { }

  /**
   * Set up the local webcam and if the user has webcam we create the local preview
   */
  setupLocalWebcam(){
    // get media video from navigateur of user
    navigator.getUserMedia({video: true}, (t) => {
      // webcam is available
      console.log('webcam is available')
      this.twilioService.camDeactivate = false;
      this.twilioService.createLocalPreview();
    }, () => {
      console.log('webcam is not available')
      this.twilioService.camDeactivate = true;
      // webcam is not available
    });
  }

  /**
   * Mute your video in a Room.
   * @returns {void}
   */
  muteYourVideo() {
    this.twilioService.muteOrUnmuteYourRemoteMedia('video', 'mute');
  }

  /**
   * Unmute your video in a Room.
   * @returns {void}
   */
  unmuteYourVideo() {
    this.twilioService.muteOrUnmuteYourRemoteMedia('video', 'unmute');
  }

}
