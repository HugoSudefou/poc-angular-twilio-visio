import {AfterViewInit, Component} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {TwilioService} from './services/twilio-service.service';
import {VideoService} from './services/video/video.service';
import {MicrophoneService} from './services/microphone/microphone.service';
import {Router} from '@angular/router';


export interface TestsItems {
  name : string ;
  status : string;

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'poc-angular-twilio-visio';

  message: string;
  roomName: string = 'roomName';
  identity: string = 'identity';
  micStatus: boolean = true;
  videoStatus: boolean = true;

  room = null;

  public name: any;

  constructor() {

  }

  ngOnInit() {
  }

}
