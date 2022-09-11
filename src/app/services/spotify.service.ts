import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthorizationService } from './authorization.service';
import { User } from '../models/user.model';
import { Track } from '../models/track.model';
import { PlayingState } from '../models/playingstate.model';
import { empty, map, merge, mergeMap, Observable, switchMap, of, interval, zip } from 'rxjs';
import { ConfiguratorService } from './configurator.service';


@Injectable({
  providedIn: 'root'
})

export class SpotifyService {
  
  refresher = interval(2000);
  public currentTrack: Track|undefined;
  constructor(private http: HttpClient, private auth: AuthorizationService, private config: ConfiguratorService) { 
    this.refresher.subscribe(()=>this.checkNextStep())
  }
  
  getUserInfo(){
    let http = "https://api.spotify.com/v1/me";
    return this.http.get<User>(http);

  }

  getCurrentlyPlaying(){
    let url = 	"https://api.spotify.com/v1/me/player/currently-playing";
    return this.http.get<PlayingState>(url).pipe(map((data:PlayingState)=>{
        if(data != null)
          this.currentTrack = data.item;   
        return data;
      }))
  }

  getTrackExtended(id: string)
  {
    let url = "https://api.spotify.com/v1/tracks/" + id;
    return this.http.get<Track>(url);
  }

  getRecentlyPlayed(amount: number){
    let url = "https://api.spotify.com/v1/me/player/recently-played"
    url +="?limit=" + amount;
    return this.http.get(url).pipe(map((data:any)=>{
      let tracks: Array<Track> = []
      data.items.forEach((element:any) => {
        tracks.push(element.track);
      });
      return tracks;
    }));
  }

  getSongProgress(): Observable<any> {
    return this.getCurrentlyPlaying().pipe(switchMap((state:PlayingState)=>{
      if(state != null)
      {
        let track = state.item;
        return zip(of((state.progress_ms/track.duration_ms)*100), of(state))
      }
      else
        return zip(of(0), of(undefined));
    }))
  }

  addTrackToPlaylist(track: Track, playlistId: string)
  {
    let url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks";
    url += "?uris="+encodeURI(track.uri);
    console.log(url);
    return this.isTrackInPlaylist(track.id, playlistId).pipe(switchMap((resultObs)=>{
        if(!resultObs)
          return this.http.post(url,"");
        else
          return of("Already Exists!");
      }))
  }

  isTrackInPlaylist(trackId:string, playlistId: string) : Observable<boolean>
  {
    let url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks"
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

  protected checkNextStep(){
    let conf = this.config.loadConfig();
    this.getSongProgress().subscribe(([progress, state]) => {
      if(state != null)
      {
        if(conf.autoAdd && progress > conf.whenToAdd)
          this.autoAdd(state);
        
        if(conf.autoRemove && progress > conf.whenToRemove) 
          this.autoRemove(state);
    
      }
    })
  }
  autoAdd(state: PlayingState){
    if(state.context != null && state.context.type == "playlist")
    {
      let playlistId = state.context.uri.split(":")[2];
      this.addTrackToPlaylist(state.item, playlistId).subscribe();
    }
    else
      console.log("Not playing a playlist");
  }
  autoRemove(state: PlayingState){

  }

}