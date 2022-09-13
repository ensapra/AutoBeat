import { trigger } from '@angular/animations';
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

  private leftColor: string = "#000000";
  private rightColor:string = "#ffffff";

  private currentLeft: string = "#000000";
  private currentRight:string = "#ffffff";

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
    return { 'background-image': 'linear-gradient(to bottom right,'+this.currentLeft+', '+this.currentRight+')'};
  }

  progressContainerSettings():any
  {
    if (this.palette?.Muted) {
      return { 'background-color': this.palette.Muted.getHex()};
    } else {
      return { 'background-color': '#00000'};
    }
  }
  progressSettings():any{
    if (this.palette?.DarkMuted) {
      return { 'background-color': this.palette.DarkMuted.getHex(), 'width' : this.songProgress+"%"};
    } else {
      return { 'background-color': '#00000', 'width' : this.songProgress+"%"};
    }
  }
  updateTrackProgress(progress: number)
  {
    this.songProgress = progress;
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
        this.currentTrackImage = currentTrack.album.images[0];
        Vibrant.from(this.currentTrackImage.url).getPalette((err, palette) => {
          this.palette = palette;
          this.animateColors();
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
        this.updateTrackProgress(progress);    
        if(this.currentTrackImage == undefined)
          this.updatePalette(this.currentTrack)
      }
      else
        console.log("nothing");        
    })
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

  animateColors(){
    if(this.palette?.DarkMuted && this.palette?.Muted)
    {
      let targetLeft: string = this.palette.DarkMuted.getHex();
      let targetRight: string = this.palette.Muted.getHex();
      let calls = 0;
      let timeFrame = setInterval(()=> {
        this.currentLeft = lerpColor(this.leftColor, targetLeft, calls/50);
        this.currentRight = lerpColor(this.rightColor, targetRight, calls/50);
        if(calls === 50) {
          this.leftColor = targetLeft;
          this.rightColor = targetRight;
          clearInterval(timeFrame);
        }
        calls++;
      }, 16.667);
    }
  }
}

const lerpColor = function(a:string, b:string, amount:number) { 
  var ah = parseInt(a.replace(/#/g, ''), 16),
      ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
      bh = parseInt(b.replace(/#/g, ''), 16),
      br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
      rr = ar + amount * (br - ar),
      rg = ag + amount * (bg - ag),
      rb = ab + amount * (bb - ab);
  return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}