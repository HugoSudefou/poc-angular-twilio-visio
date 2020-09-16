import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {TwilioService} from './services/twilio-service.service';
import {AngularFireDatabase} from '@angular/fire/database';
import {Room} from './interfaces/room';
import {TestTwilioService} from './services/test-twilio.service';


export interface TestsItems {
  name : string ;
  status : string;

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'poc-angular-twilio-visio';

  message: string;
  accessToken: string;
  roomName: string = 'roomName';
  identity: string = 'identity';
  micStatus: boolean = true;
  videoStatus: boolean = true;

  guardCam = false;
  guardMic = false;

  listRooms: Room[] = null;
  room: Room = null;
11
  public data$: any;
  tt : any;
  public name: any;

  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('participantVideo') participantVideo: ElementRef;
  @ViewChild('remoteVideo') remoteVideo: ElementRef;

  constructor(private db: AngularFireDatabase, private fns: AngularFireFunctions, private twilioService: TwilioService, private cd: ChangeDetectorRef, private twilioTestService: TestTwilioService) {
    this.twilioService.msgSubject.subscribe(r => {
      this.message = r;
    });
  }

  ngOnInit() {
    this.twilioService.localVideo = this.localVideo;
    this.twilioService.remoteVideo = this.remoteVideo;
    this.twilioService.participantVideo = this.participantVideo;
  }

  ngAfterViewInit() {

    navigator.getUserMedia({audio: true}, () => {
      // webcam is available
      console.log('audio is available')
      this.twilioTestService.micDeactivate = false;
      this.guardMic = true;
    }, () => {
      console.log('audio is not available')
      this.twilioTestService.micDeactivate = true;
      this.guardMic = false;
      // webcam is not available
    });

    navigator.getUserMedia({video: true}, (t) => {
      // webcam is available
      console.log('webcam is available')
      this.twilioTestService.camDeactivate = false;
      this.guardCam = true;
      this.previewCam();
    }, () => {
      console.log('webcam is not available')
      this.twilioTestService.camDeactivate = true;
      this.guardCam = false;
      // webcam is not available
    });

    this.twilioService.localVideo = this.localVideo;
    this.twilioService.remoteVideo = this.remoteVideo;
    this.twilioService.participantVideo = this.participantVideo;
  }

  log(message) {
    this.message = message;
  }

  disconnect() {
    if (this.twilioTestService.activeRoom && this.twilioTestService.activeRoom !== null) {
      this.twilioTestService.deconnexion();
    }
  }

  // addVision(){
  //   let newBook = this.name || 'test';
  //   this.tt.update({name: newBook});
  // }

  /*
  * Test cm Change
  * */

  previewCam(){

    console.log('this.twilioTestService.camDeactivate : ', this.twilioTestService.camDeactivate)
    console.log('this.twilioTestService.micDeactivate : ', this.twilioTestService.micDeactivate)
    console.log('this.guardCam : ', this.guardCam)
    console.log('this.guardMic : ', this.guardMic)
    this.twilioTestService.localPreview();
  }

  unPreviewCam(){
    this.twilioTestService.unPreviewCam();
  }

  joinRoom(){

  }

  leaveRoom(){
    this.twilioTestService.leaveRoomIfJoined();
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
      this.twilioTestService.muteYourAudio();
    } else {
      this.twilioTestService.unmuteYourAudio();
    }
    this.micStatus = !this.micStatus
  }

  videoUnvideo(){
    if(this.videoStatus){
      this.twilioTestService.muteYourVideo();
    } else {
      this.twilioTestService.unmuteYourVideo();
    }
    this.videoStatus = !this.videoStatus
  }

  muteVideoLocal(){
    this.twilioTestService.muteOrUnmuteYourLocalMedia('video', true);
  }

  muteAudioLocal(){
    this.twilioTestService.muteOrUnmuteYourLocalMedia('audio', true);
  }

  unmuteYourVideoLocal(){
    this.twilioTestService.muteOrUnmuteYourLocalMedia('video', false);
  }

  unmuteYourAudioLocal(){
    this.twilioTestService.muteOrUnmuteYourLocalMedia('audio', false);
  }

  // stop only camera
  stopVideoOnly(stream, muted) {
    stream.getTracks().forEach((track) => {
      if (track.readyState == 'live' && track.kind === 'video') {
        if(muted){
          this.twilioTestService.detachTracks([track]);
          track.stop();
        }
      }
    });
  }

  // stop only mic
  stopAudioOnly(stream, muted) {
    stream.getTracks().forEach((track) => {
      if (track.readyState == 'live' && track.kind === 'audio') {
        if(muted){
          console.log('track : ', track)
          track.stop();
        }
      }
    });
  }

  roomSelected(room){
    console.log('room selected : ', room)
    console.log('room selected : ', this.room)
  }

  getListRooms(){
    this.twilioService.listRooms().subscribe(value => {
      console.log('getListRooms value : ', value.rooms)
      this.listRooms = value.rooms;
      this.cd.detectChanges();
    })
  }

  createRoom(){
    this.twilioService.createRoom('roomNewName').subscribe(value => {
      console.log('value : ', value)
    })
  }

  connect(): void {
    let date = Date.now();

    if (!this.roomName || !this.identity) { this.message = "enter username and room name."; return;}

    this.twilioService.getToken(this.identity, this.roomName).subscribe(d => {
        console.log('subscribe : ', d)
        this.accessToken = d['token'];
        // localStorage.setItem('token', JSON.stringify({
        //   token: this.accessToken,
        //   created_at: date
        // }));
        this.twilioTestService.connectToRoom(this.accessToken, { name: this.roomName, audio: true}, this.roomName, this.identity)
      },
      error => {
        console.log('error : ', error)
      });

  }

  test(){
    console.log('test this.listRooms : ', this.listRooms)
    console.log('test this.room : ', this.room)
  }

}
