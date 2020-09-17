import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import {TwilioService} from './services/twilio-service.service';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { RoomComponent } from './components/room/room.component';
import { HomeComponent } from './components/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    RoomComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase, 'poc-angular-twilio-visio'),
    AngularFireFunctionsModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [TwilioService],
  bootstrap: [AppComponent]
})
export class AppModule { }
