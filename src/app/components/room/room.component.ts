import {Component, OnInit} from '@angular/core';
import {TwilioService} from '../../services/twilio-service.service';
import {ActivatedRoute} from '@angular/router';
import {MicrophoneService} from '../../services/microphone/microphone.service';
import {VideoService} from '../../services/video/video.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  roomName:string = null;
  identity:string = null;
  accessToken:string = null;
  micStatus: boolean = true;
  videoStatus: boolean = true;

  constructor(private twilioService: TwilioService, private route :ActivatedRoute, private microphoneService: MicrophoneService, private videoService: VideoService) {

    this.roomName = this.route.snapshot.paramMap.get('roomName')
    this.identity = this.route.snapshot.paramMap.get('identity')
  }

  /**
   * on init if we are identity and roomName we get the access token for twilio
   * if we don't hace local preview and the webcam is enable we recreate the localPreview
   */
  ngOnInit(): void {

    if(!!this.identity && !!this.roomName){
      if(!this.twilioService.camDeactivate && !this.twilioService.previewTracks) {
        this.twilioService.createLocalPreview();
      }
      this.twilioService.getToken(this.identity, this.roomName).subscribe(d => {
          console.log('subscribe : ', d)
          this.accessToken = d['token'];
          this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true}, this.roomName, this.identity)
        },
        error => {
          console.log('error : ', error)
        }
      );
    }

  }

  leaveRoom(){
    this.twilioService.leaveRoomIfJoined();
  }

  /**
   * String of btn mute/unmute audio
   */
  textMuteUnmute(){
    if(this.micStatus){
      return 'Mute';
    } else {
      return 'Unmute';
    }
  }

  /**
   * String of btn mute/unmute video
   */
  textVideoUnvideo(){
    if(this.videoStatus){
      return 'Mute Video';
    } else {
      return 'Unmute Video';
    }
  }

  /**
   * mute/unmute audio
   */
  muteUnmute(){
    if(this.micStatus){
      this.microphoneService.muteYourAudio();
    } else {
      this.microphoneService.unmuteYourAudio();
    }
    this.micStatus = !this.micStatus
  }

  /**
   *  mute/unmute audio
   */
  videoUnvideo(){
    if(this.videoStatus){
      this.videoService.muteYourVideo();
    } else {
      this.videoService.unmuteYourVideo();
    }
    this.videoStatus = !this.videoStatus
  }

}
