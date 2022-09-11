import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthorizationService } from './authorization.service';
import { User } from '../models/user.model';
import { Track, TrackState } from '../models/track.model';
import { PlayingState } from '../models/playingstate.model';
import { empty, map, merge, mergeMap, Observable, switchMap, of, interval, zip, Subject } from 'rxjs';
import { ConfiguratorService } from './configurator.service';


@Injectable({
  providedIn: 'root'
})

export class SpotifyService {
  
  refresher = interval(2000);
  private currentTrack: Track|undefined;
  public onChangeTrack : Subject<{previousTrack:Track|undefined, currentTrack:Track|undefined}> = new Subject();

  constructor(private http: HttpClient, private auth: AuthorizationService, private config: ConfiguratorService) { 
  }
  
  getUserInfo(){
    const http = "https://api.spotify.com/v1/me";
    return this.http.get<User>(http);

  }

  getCurrentlyPlaying(){
    const url = 	"https://api.spotify.com/v1/me/player/currently-playing";
    return this.http.get<PlayingState>(url).pipe(map((data:PlayingState)=>{
        if(this.currentTrack?.id !== data.item.id)
        {
          this.onChangeTrack.next({previousTrack:this.currentTrack, currentTrack:data.item});
          this.currentTrack = data.item;
          this.currentTrack.trackState = TrackState.None;
        }
        if(this.currentTrack.trackState == 0)
          this.checkNextStep(this.currentTrack, data);
        return data;
      }))
  }

  getTrackExtended(id: string)
  {
    const url = "https://api.spotify.com/v1/tracks/" + id;
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
        if(result != "failure" && this.currentTrack != undefined){
          this.currentTrack.trackState = TrackState.Added;
        }
      });
    }
    else
      console.log("Not playing a playlist");
  }
  autoRemove(state: PlayingState){

  }

}