import {Component, OnInit} from '@angular/core';
import {TwilioService} from '../../services/twilio-service.service';
import {ActivatedRoute} from '@angular/router';

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

  constructor(private twilioService: TwilioService, private route :ActivatedRoute) {

    this.roomName = this.route.snapshot.paramMap.get('roomName')
    this.identity = this.route.snapshot.paramMap.get('identity')
  }

  ngOnInit(): void {

    if(!!this.identity && !!this.roomName){
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

  connectTwilio(){

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


}
