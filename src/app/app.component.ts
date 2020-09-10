import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {TwilioService} from './services/twilio-service.service';
import {AngularFireDatabase} from '@angular/fire/database';
import {Room} from './interfaces/room';


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

  listRooms: Room[] = null;
  room: Room = null;

  public data$: any;
  tt : any;
  public name: any;

  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('remoteVideo') remoteVideo: ElementRef;

  constructor(private db: AngularFireDatabase, private fns: AngularFireFunctions, private twilioService: TwilioService, private cd: ChangeDetectorRef) {
    this.twilioService.msgSubject.subscribe(r => {
      this.message = r;
    });
  }

  ngOnInit() {
    this.twilioService.localVideo = this.localVideo;
    this.twilioService.remoteVideo = this.remoteVideo;
  }

  ngAfterViewInit() {
    this.twilioService.localVideo = this.localVideo;
    this.twilioService.remoteVideo = this.remoteVideo;
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
    let storage = JSON.parse(localStorage.getItem('token') || '{}');
    let date = Date.now();
    console.log({storage, date})
    if (!this.roomName || !this.identity) { this.message = "enter username and room name."; return;}
    if (storage['token'] && storage['created_at'] + 3600000 > date) {
      this.accessToken = storage['token'];
      this.twilioService.connectToRoom(this.accessToken, {  name: this.roomName, audio: true, video: { width: 240 } })
      return;
    }
    this.twilioService.getToken(this.identity, this.roomName).subscribe(d => {
        console.log('subscribe : ', d)
        this.accessToken = d['token'];
        localStorage.setItem('token', JSON.stringify({
          token: this.accessToken,
          created_at: date
        }));
        this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 } })
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
