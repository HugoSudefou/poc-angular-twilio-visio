import { Injectable } from '@angular/core';
import {TwilioService} from '../twilio-service.service';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private twilioService: TwilioService) { }

  tryWebcam(){
    navigator.getUserMedia({video: true}, (t) => {
      // webcam is available
      console.log('webcam is available')
      this.twilioService.camDeactivate = false;
      this.twilioService.localPreview();
    }, () => {
      console.log('webcam is not available')
      this.twilioService.camDeactivate = true;
      // webcam is not available
    });
  }

  // stop only camera
  stopVideoOnly(track) {
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
  }

  getLocalTrackMedia(kind){
    // webcam is available
    let localTrack = this.twilioService.previewTracks;
    let track: any = [];

    if(localTrack[0].kind === 'video'){
      track = localTrack[0]
    } else if(localTrack[1].kind === 'video'){
      track = localTrack[1]
    }
  }



  muteVideoLocal(){
    return this.stopVideoOnly(track);
  }

  unmuteVideoLocal(){
    return navigator.getUserMedia({video: true}, (stream) => {
      // webcam is available
      return this.startVideoOnly(stream, true);
    }, () => {
      // webcam is not available
      return null;
    });
  }



  /**
   * Mute your video in a Room.
   * @returns {void}
   */
  muteYourVideo() {
    this.twilioService.muteOrUnmuteYourMedia('video', 'mute');
  }

  /**
   * Unmute your video in a Room.
   * @returns {void}
   */
  unmuteYourVideo() {
    this.twilioService.muteOrUnmuteYourMedia('video', 'unmute');
  }

}
