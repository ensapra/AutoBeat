import { state, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import Vibrant from 'node-vibrant';
import { Palette } from 'node-vibrant/lib/color';
import { map, Observable,interval, timestamp, Subscription } from 'rxjs';
import { Image } from '../models/image.model';
import { PlayingState } from '../models/playingstate.model';
import { Playlist } from '../models/playlist.model';
import { Track, TrackState } from '../models/track.model';
import { User } from '../models/user.model';
import { AnimatorService } from '../services/animator.service';
import { AuthorizationService } from '../services/authorization.service';
import { ConfiguratorService } from '../services/configurator.service';
import { SpotifyService } from '../services/spotify.service';
import { VisualService } from '../services/visual.service';
import { TrackComponent } from '../track/track.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  @ViewChild(TrackComponent) trackChild !: TrackComponent;
  
  protected user: User|undefined
  protected currentTrack: Track|undefined;
  protected playlist: Playlist|undefined;
  
  //protected userImageUrl: string|undefined;
  /* protected songProgress:number = 0;
  protected currentTrackImage: Image|undefined; */
  private onChangeSubscription:Subscription|undefined;
  private onRefreshSubscription:Subscription|undefined;

  protected palette: Palette|undefined;

  constructor(private auth: AuthorizationService, protected apiRequester: SpotifyService, protected visual: VisualService, protected config: ConfiguratorService) {
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
  ngOnDestroy(){
    this.onChangeSubscription?.unsubscribe();
    this.onRefreshSubscription?.unsubscribe();
  }
  addCurrentSong()
  {
    if(this.apiRequester.playState != undefined)
      this.apiRequester.autoAdd(this.apiRequester.playState);
  }
  initialize()
  {
    if(this.auth.authorizationValues)
    {
      this.onRefreshSubscription=this.apiRequester.refresher.subscribe(() => this.refreshCurrentlyPlaying());
      this.onChangeSubscription = this.apiRequester.onChangeTrack.subscribe(
        (value:{previousTrack:Track|undefined, state:PlayingState|undefined, currentTrack:Track|undefined}) => 
          this.refreshOnChangePlaylist(value.currentTrack, value.state))   
      this.refreshCurrentlyPlaying(); 
    }
  }

  refreshCurrentlyPlaying()
  {
    this.apiRequester.getCurrentTrack().subscribe((currentTrack:Track|undefined) =>
    {
      this.currentTrack = currentTrack;
    })
  }

  refreshOnChangePlaylist(value:Track|undefined, state: PlayingState|undefined){
    if(state?.playlistPlayingId != undefined)
    { 
      this.apiRequester.getPlaylist(state.playlistPlayingId).subscribe((play:Playlist)=>{
        this.playlist = play;
      });
    }
    else
      this.playlist = undefined;
  }

  getPlaylistImage(){
    if(this.playlist != undefined)
      return this.playlist.images[0].url;
    else
      return "";
  }

  wasAdded():boolean{
    return this.currentTrack?.trackState != TrackState.None;
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