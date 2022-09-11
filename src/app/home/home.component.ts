import { Component, OnInit, ViewChild } from '@angular/core';
import Vibrant from 'node-vibrant';
import { Palette } from 'node-vibrant/lib/color';
import { map, Observable,interval, timestamp, Subscription } from 'rxjs';
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

  @ViewChild(TrackComponent) trackChild !: TrackComponent;
  protected user: User|undefined
  //protected userImageUrl: string|undefined;
  protected currentTrack: Track|undefined;
  protected playingState: PlayingState|undefined;
  protected songProgress:number = 0;
  protected currentTrackImage: Image|undefined;
  protected palette: Palette|undefined;

  private onChangeSubscription:Subscription;
  private onRefreshSubscription:Subscription|undefined;

  constructor(private auth: AuthorizationService, private apiRequester: SpotifyService, private config: ConfiguratorService) {
    if(window.location.search.length > 0){
      this.handleRedirect().subscribe(
        () => this.initialize()
      );
    }
    else
      this.initialize();

      this.onChangeSubscription = apiRequester.onChangeTrack.subscribe((value:{previousTrack:Track|undefined, currentTrack:Track|undefined})=>{
      if(value.currentTrack != undefined)
        this.updatePalette(value.currentTrack);
    })    
  }

  bkgColor():any {
    if (this.palette?.DarkMuted) {
      return { 'background-color': this.palette.DarkMuted.getHex()};
    } else {
      return { 'background-color': '#FFFFFF'};
    }
  }

  ngOnInit(): void {
  }
  ngOnDestroy(){
    this.onChangeSubscription.unsubscribe();
    this.onRefreshSubscription?.unsubscribe();
  }
  updatePalette(currentTrack: Track|undefined)
  {
    if(currentTrack != undefined)
      {
        this.currentTrackImage = currentTrack.album.images[1];
        Vibrant.from(this.currentTrackImage.url).getPalette((err, palette) => {
          this.palette = palette;
        });
      }
  }

  initialize()
  {
    if(this.auth.authorizationValues)
    {
      this.apiRequester.getUserInfo().subscribe((data:User) =>
      {
        this.user = data;
        //this.userImageUrl = data.images[0].url;
      });    
      this.onRefreshSubscription=this.apiRequester.refresher.subscribe(() => this.refreshCurrentlyPlaying());
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
        let progress = (this.playingState.progress_ms/this.currentTrack.duration_ms)*100;
        this.trackChild.updateTrackProgress(progress);    
        if(this.currentTrackImage == undefined)
          this.updatePalette(this.currentTrack)
      }
      else
        console.log("nothing");        
    })
  }

/*   updateSongInfo(state: PlayingState, track: Track)
  {
    this.songProgress = (state.progress_ms/track.duration_ms)*100;
    this.currentTrackImage = track.album.images.length > 0 ? track.album.images[0] : undefined;
  } */


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
