import {AfterViewInit, Component, OnInit} from '@angular/core';
import {TwilioService} from '../../services/twilio-service.service';
import {VideoService} from '../../services/video/video.service';
import {MicrophoneService} from '../../services/microphone/microphone.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {


  message: string;
  roomName: string = 'roomName';
  identity: string = 'identity';
  micStatus: boolean = true;
  videoStatus: boolean = true;

  room = null;

  public name: any;
  constructor(private twilioService: TwilioService,
              private videoService: VideoService,
              private microphoneService: MicrophoneService,
              private route: Router) { }

  ngOnInit(): void {
  }

  /**
   * after view is init we setup audio and video of local user
   */
  ngAfterViewInit() {
    // test if mic and video is work
    this.microphoneService.setupMicrophone();
    this.videoService.setupLocalWebcam();

  }

  log(message) {
    this.message = message;
  }

  /**
   * create local preview on demand
   */
  previewCam(){
    this.twilioService.createLocalPreview();
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
   * mute/unmute video
   */
  videoUnvideo(){
    if(this.videoStatus){
      this.twilioService.muteOrUnmuteYourLocalMediaPreview('video', true);
    } else {
      this.twilioService.muteOrUnmuteYourLocalMediaPreview('video', false);
    }
    this.videoStatus = !this.videoStatus
  }

  /**
   * mute/unmute audio
   */
  muteUnmute(){
    if(this.micStatus){
      this.twilioService.muteOrUnmuteYourLocalMediaPreview('audio', true);
    } else {
      this.twilioService.muteOrUnmuteYourLocalMediaPreview('audio', false);
    }
    this.micStatus = !this.micStatus
  }

  /**
   * Go to room want click on btn if identity and roomName is not empty
   */
  goToRoom(): void {
    if (!this.roomName || !this.identity) { this.message = "enter username and room name."; return;}
    this.route.navigateByUrl(`room/${this.roomName}/${this.identity}`)
  }
}
