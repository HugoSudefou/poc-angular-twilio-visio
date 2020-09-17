import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AppComponent} from './app.component';
import {RoomComponent} from './components/room/room.component';
import {HomeComponent} from './components/home/home.component';

const routes: Routes = [
  {path:'', component: HomeComponent},
  {path:'room/:roomName/:identity', component: RoomComponent},
  {path:'**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
