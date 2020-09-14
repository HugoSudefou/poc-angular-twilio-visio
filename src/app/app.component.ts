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
    this.twilioService.localVideo = this.localVideo;
    this.twilioService.remoteVideo = this.remoteVideo;
    this.twilioService.participantVideo = this.participantVideo;
  }

  log(message) {
    this.message = message;
  }

  disconnect() {
    if (this.twilioService.roomObj && this.twilioService.roomObj !== null) {
      this.twilioService.roomObj.disconnect();
      this.twilioService.roomObj = null;
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
    this.twilioTestService.localPreview();
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
    if(this.micStatus){
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


  unMuteVideo(){
    const video = document.querySelector('video');

    // A video's MediaStream object is available through its srcObject attribute
    const mediaStream: any = video.srcObject;

    // Through the MediaStream, you can get the MediaStreamTracks with getTracks():
    const tracks = mediaStream.getTracks();
    tracks.forEach(track => track)

    this.previewCam();
  }

  muteVideo(){
    this.twilioTestService.previewTracks = null;
    const video = document.querySelector('video');

    // A video's MediaStream object is available through its srcObject attribute
    const mediaStream: any = video.srcObject;

    // Through the MediaStream, you can get the MediaStreamTracks with getTracks():
    const tracks = mediaStream.getTracks();

    // Tracks are returned as an array, so if you know you only have one, you can stop it with:
    // tracks[0].stop();

    // Or stop all like so:
    tracks.forEach(track => track.stop())

  }

  uuuuuu(muted){
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(mediaStream => {
        this.stopVideoOnly(mediaStream, muted)
      })
  }

  dsqdsd(muted){
    navigator.mediaDevices.getUserMedia({video: false, audio: true})
      .then(mediaStream => {
        this.stopAudioOnly(mediaStream, muted)
      })
  }

  // stop only camera
  stopVideoOnly(stream, muted) {
    stream.getTracks().forEach((track) => {
      if (track.readyState == 'live' && track.kind === 'video') {
        if(muted){
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
        this.twilioTestService.connectToRoom(this.accessToken, { name: this.roomName}, this.roomName, this.identity)
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
