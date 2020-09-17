import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
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
  constructor(private fns: AngularFireFunctions,
              private twilioService: TwilioService,
              private videoService: VideoService,
              private microphoneService: MicrophoneService,
              private route: Router) { }

  ngOnInit(): void {
  }


  ngAfterViewInit() {
    // test if mic and video is work
    this.microphoneService.tryMicrophone();
    this.videoService.tryWebcam();

  }

  log(message) {
    this.message = message;
  }

  disconnect() {
    if (this.twilioService.activeRoom && this.twilioService.activeRoom !== null) {
      this.twilioService.deconnexion();
    }
  }

  previewCam(){
    this.twilioService.localPreview();
  }

  leaveRoom(){
    this.twilioService.leaveRoomIfJoined();
  }


  textMuteUnmute(){
    if(this.micStatus){
      return 'Mute';
    } else {
      return 'Unmute';
    }
  }

  textVideoUnvideo(){
    if(this.videoStatus){
      return 'Mute Video';
    } else {
      return 'Unmute Video';
    }
  }

  muteUnmute(){
    if(this.micStatus){
      this.microphoneService.muteYourAudio();
    } else {
      this.microphoneService.unmuteYourAudio();
    }
    this.micStatus = !this.micStatus
  }

  videoUnvideo(){
    if(this.videoStatus){
      this.videoService.muteYourVideo();
    } else {
      this.videoService.unmuteYourVideo();
    }
    this.videoStatus = !this.videoStatus
  }

  muteVideoLocal(){
    this.twilioService.muteOrUnmuteYourLocalMedia('video', true);
  }

  muteAudioLocal(){
    this.twilioService.muteOrUnmuteYourLocalMedia('audio', true);
  }

  unmuteYourVideoLocal(){
    this.twilioService.muteOrUnmuteYourLocalMedia('video', false);
  }

  unmuteYourAudioLocal(){
    this.twilioService.muteOrUnmuteYourLocalMedia('audio', false);
  }


  connect(): void {
    if (!this.roomName || !this.identity) { this.message = "enter username and room name."; return;}
    this.route.navigateByUrl(`room/${this.roomName}/${this.identity}`)
  }
}
