import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router, Event as NavigationEvent } from '@angular/router';
import { map, Observable,interval, timestamp } from 'rxjs';
import { Image } from '../models/image.model';
import { PlayingState } from '../models/playingstate.model';
import { Track } from '../models/track.model';
import { User } from '../models/user.model';
import { AuthorizationService } from '../services/authorization.service';
import { ConfiguratorService } from '../services/configurator.service';
import { SpotifyService } from '../services/spotify.service';
import { TrackComponent } from '../track/track.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  protected user: User|undefined
  protected userImageUrl: string|undefined;
  protected currentTrack: Track|undefined;

  protected playingState: PlayingState|undefined;

  protected songProgress:number = 0;

  protected currentTrackImage: Image|undefined;
  constructor(private auth: AuthorizationService, private apiRequester: SpotifyService, private config: ConfiguratorService) {
    if(window.location.search.length > 0){
      this.handleRedirect().subscribe(
        () => this.initialize()
      );
    }
    else
      this.initialize();
  }
  

  ngOnInit(): void {
  }

  initialize()
  {
    if(this.auth.authorizationValues)
    {
      this.apiRequester.getUserInfo().subscribe((data:User) =>
      {
        this.user = data;
        this.userImageUrl = data.images[0].url;
      });    
      this.apiRequester.refresher.subscribe(() => this.refreshCurrentlyPlaying());
      this.refreshCurrentlyPlaying(); 
    }
  }

  refreshCurrentlyPlaying()
  {
    this.apiRequester.getCurrentlyPlaying().subscribe((playingData:PlayingState) =>
    {
      if(playingData != null)
      {
        this.playingState = playingData;
        this.currentTrack = playingData.item;
        this.updateSongInfo(this.playingState, this.currentTrack);      
      }
      else
        console.log("nothing");        
    })
  }

  updateSongInfo(state: PlayingState, track: Track)
  {
    this.songProgress = (state.progress_ms/track.duration_ms)*100;
    this.currentTrackImage = track.album.images.length > 0 ? track.album.images[0] : undefined;
  }


  handleRedirect() : Observable<any>{
    let code = this.getCode();
    return this.auth.fetchAccessToken(code);
  }

  getCode(){
    let code = null;
    const queryString = window.location.search;
    if(queryString.length > 0){
      const urlParams = new URLSearchParams(queryString);
      code = urlParams.get('code')
    }
    return code;
  }
}
