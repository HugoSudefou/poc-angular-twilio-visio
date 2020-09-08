import { Component } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";
import {AngularFireList} from '@angular/fire/database';
import {TwilioService} from './services/twilio-service.service';


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
  accessToken: string;
  roomName: string = 'test';
  username: string = 'test';

  public tests: any;
  public test: any;
  tt : any;
  public name: any;
  constructor(db: AngularFireDatabase, private twilioService: TwilioService) {
    this.tt = db.object('/tests/tt');
  }

  addVision(){
    let newBook = this.name || 'test';
    this.tt.update({name: newBook});
  }

  connect(): void {
    let storage = JSON.parse(localStorage.getItem('token') || '{}');
    let date = Date.now();
    console.log({storage, date})
    if (!this.roomName || !this.username) { this.message = "enter username and room name."; return;}
    if (storage['token'] && storage['created_at'] + 3600000 > date) {
      this.accessToken = storage['token'];
      this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 } })
      return;
    }
    console.log('storage : ', storage)
    this.twilioService.getToken(this.username).subscribe(d => {
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
}
