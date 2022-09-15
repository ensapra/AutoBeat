import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Track, TrackState } from '../models/track.model';
import { PlayingState } from '../models/playingstate.model';
import {  map, Observable, switchMap, of, interval, Subject } from 'rxjs';
import { ConfiguratorService } from './configurator.service';
import { Playlist } from '../models/playlist.model';


@Injectable({
  providedIn: 'root'
})

export class SpotifyService {
  
  refresher = interval(2000);
  public currentTrack: Track|undefined;
  public playState: PlayingState|undefined;
  public onChangeTrack : Subject<{previousTrack:Track|undefined, state: PlayingState|undefined, currentTrack:Track|undefined}> = new Subject();

  constructor(private http: HttpClient, private config: ConfiguratorService) { 
  }
  
  getUserInfo(){
    const http = "https://api.spotify.com/v1/me";
    return this.http.get<User>(http);

  }

  getTrackImageURL(){
    if(this.currentTrack != undefined)
      return this.currentTrack.album.images[0].url;
    else
      return "../assets/picture-not-available.jpg";
  }

  getCurrentlyPlaying(){
    const url = 	"https://api.spotify.com/v1/me/player/currently-playing";
    return this.http.get<PlayingState>(url).pipe(map((data:PlayingState)=>{
        this.playState = data != null ? data: undefined;
        if(this.currentTrack?.id !== data?.item.id)
        {
          let previousTrack = this.currentTrack;
          this.currentTrack = data?.item;
          if(this.currentTrack != undefined)
            this.currentTrack.trackState = TrackState.None;
          
          if(data?.context?.uri)
          {
            const parts = data.context.uri.split(":");
            if(parts[1] == "playlist")
            {
              const id = parts[2];
              data.playlistPlayingId = id;
              this.isTrackInPlaylist(this.currentTrack.id, id).subscribe((inPlaylist:boolean)=>
              {
                if(inPlaylist && this.currentTrack != undefined)
                  this.currentTrack.trackState = TrackState.Exists;
              })
            }
          }
          this.onChangeTrack.next({previousTrack:previousTrack, state:this.playState, currentTrack:this.currentTrack});
        }

        if(this.currentTrack?.trackState == 0)
          this.checkNextStep(this.currentTrack, data);
        return data;
      }))
  }
  getCurrentTrack(){
    return this.getCurrentlyPlaying().pipe(map(()=> this.currentTrack));
  }

  nothingPlaying()
  {
    if(this.currentTrack != undefined)
    {
      this.onChangeTrack.next({previousTrack:this.currentTrack, state:undefined, currentTrack:undefined});
      this.currentTrack = undefined;
    }
  }
  getTrackProgress(){
    if(this.playState != undefined && this.currentTrack != undefined)
      return (this.playState?.progress_ms/this.currentTrack?.duration_ms)*100;
    return 0;
  }

  getTrackExtended(id: string)
  {
    const url = "https://api.spotify.com/v1/tracks/" + id;
    return this.http.get<Track>(url);
  }

  getPlaylist(id: string|undefined)
  {
    const url = "https://api.spotify.com/v1/playlists/" + id;
    return this.http.get<Playlist>(url);
  }


  getRecentlyPlayed(amount: number){
    let url = "https://api.spotify.com/v1/me/player/recently-played"
    url +="?limit=" + amount;
    return this.http.get(url).pipe(map((data:any)=>{
      return data.items.map(((data:any) => {
        return data.track;
      }));
    }));
  }

  addTrackToPlaylist(track: Track, playlistId: string)
  {
    let url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks";
    url += "?uris="+encodeURI(track.uri);
    return this.isTrackInPlaylist(track.id, playlistId).pipe(switchMap((resultObs)=>{
        if(!resultObs)
          return this.http.post(url,"").pipe(switchMap((result:any)=>{
            return of(result.snapshot_id?"success":"failure");
          }));
        else
          return of("exists");
      }))
  }

  isTrackInPlaylist(trackId:string, playlistId: string) : Observable<boolean>
  {
    const url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks"
    return this.http.get(url).pipe(switchMap((data:any)=>{
      return this.getTrackExtended(trackId).pipe(switchMap((track:any)=>{
        let found: boolean = false;
        data.items.forEach((element:any) => {
          found = found || element.track.id === track.id
        });
        return of(found);
      }))
    }));
  }

  protected checkNextStep(currentTrack:Track, state: PlayingState){
    const conf = this.config.loadConfig();
    const progress = (state.progress_ms/currentTrack.duration_ms)*100;
    if(state != null)
      {
        if(conf.autoAdd && progress > conf.whenToAdd)
          this.autoAdd(state);
        
        if(conf.autoRemove && progress > conf.whenToRemove) 
          this.autoRemove(state);
      }
  }
  autoAdd(state: PlayingState){
    if(state.context != null && state.context.type == "playlist")
    {
      const playlistId = state.context.uri.split(":")[2];
      this.addTrackToPlaylist(state.item, playlistId).subscribe((result:any)=>{
        if(this.currentTrack != undefined)
        {
          if(result == "success" && this.currentTrack != undefined){
            this.currentTrack.trackState = TrackState.Added;
          }else if(result=="exists"){
            this.currentTrack.trackState = TrackState.Exists;
          }
        }
      });
    }
    else
    {
      if(this.currentTrack != undefined)
        this.currentTrack.trackState = TrackState.NotPlaylist;
    }
  }
  autoRemove(state: PlayingState){

  }

}