import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Track, TrackState } from '../models/track.model';
import { PlayingState } from '../models/playingstate.model';
import { map, Observable, switchMap, of, interval, Subject, timer } from 'rxjs';
import { ConfiguratorService } from './configurator.service';
import { Playlist } from '../models/playlist.model';


@Injectable({
  providedIn: 'root'
})

export class SpotifyService {
  
  refresher = timer(0,2000);
  public currentTrack: Track|undefined;
  public playState: PlayingState|undefined;
  
  public onChangeTrack : Subject<{previousTrack:Track|undefined, state: PlayingState|undefined, currentTrack:Track|undefined}> = new Subject();

  constructor(private http: HttpClient, private config: ConfiguratorService) { 
  }

  getPlayingState(){
    const url = 	"https://api.spotify.com/v1/me/player/currently-playing";
    return this.http.get<PlayingState>(url).pipe(map((data:PlayingState)=>{
      this.playState = data != null ? data: undefined;
      if(this.currentTrack?.id !== data?.item?.id)
        this.updateTrackState(data.item).subscribe((track:Track)=>{
          let array:Array<Track> = this.getRecentlyPlayed();
          if(this.currentTrack != undefined)
            array.push(this.currentTrack);
          this.saveHistory(array);
          const previousTrack = this.currentTrack;
          this.currentTrack = track;
          this.onChangeTrack.next({previousTrack:previousTrack, state:this.playState, currentTrack:this.currentTrack});
        });
      if(this.currentTrack?.trackState == TrackState.NotOnPlaylist)
        this.checkNextStep(this.currentTrack, data);
      return this.playState;
    }));
  }
  saveHistory(array:Array<Track>){
    array = array.filter((_, index)=> index > array.length-50)
    localStorage.setItem("previousTracks", JSON.stringify(array));
  }
  
  private updateTrackState(track:Track):Observable<Track>{ //Not sure if it works
    return new Observable((observer:any)=>{
      const playlist = this.isPlayingPlaylist(this.playState)
      if(playlist.isPlay){
        this.isTrackInPlaylist(track.id, playlist.id).subscribe((isInPlaylist:boolean)=>{
          if(isInPlaylist)
            track.trackState = TrackState.AlreadyOnPlaylist;
          else
            track.trackState = TrackState.NotOnPlaylist;
          this.getPlaylist(playlist.id).subscribe((playlist:Playlist)=>{
            track.playlist = playlist;
            observer.next(track);
          })
        })
      }
      else{
        if(track != null)
        {          
          track.trackState = TrackState.NotPlayingPlaylist;
          observer.next(track);
        }
        else
          observer.next(undefined);
      }
    });
  }

  isPlayingPlaylist(state: PlayingState|undefined){
    if(state == undefined || state.context == undefined || state.context.uri == undefined)
      return {isPlay: false, id: ""};
    const parts = state.context.uri.split(":");
    const playlistId = parts[2];
    return {isPlay: parts[1] == "playlist", id: playlistId};
  }

  isTrackInPlaylist(trackId:string, playlistId:string) : Observable<boolean>
  {
    const url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks"
    return this.http.get(url).pipe(switchMap((data:any)=>{
      let found: boolean = false;
      data.items.forEach((element:any) => {
        found = found || element.track.id === trackId;
      });
      return of(found);
    }));
  }
  getTrackProgress(){
    if(this.playState != undefined && this.currentTrack != undefined)
      return (this.playState?.progress_ms/this.currentTrack?.duration_ms)*100;
    return 0;
  }

  private getPlaylist(id: string|undefined)
  {
    const url = "https://api.spotify.com/v1/playlists/" + id;
    return this.http.get<Playlist>(url);
  }

  getPlaylists(){
    const url = "https://api.spotify.com/v1/me/playlists?limit=50";
    return this.http.get(url)
  }

  getRecentlyPlayed(){
    let json = localStorage.getItem("previousTracks");
    if(json != null)
      return JSON.parse(json);
    else
      return new Array<Track>();
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
  addCurrentSong(state: PlayingState){
    const val = this.isPlayingPlaylist(this.playState);
    if(val.isPlay){
      this.addTrackToPlaylist(state.item, val.id).subscribe((result:any)=>{
        if(this.currentTrack != undefined)
        {
          if(result == "success" && this.currentTrack != undefined){
            this.currentTrack.trackState = TrackState.AddedToPlaylist;
          }else if(result=="exists"){
            this.currentTrack.trackState = TrackState.AlreadyOnPlaylist;
          }
        }
      });
    }
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
    if(this.currentTrack?.playlist != undefined)
    {
      const playlistId = this.currentTrack.playlist.id;
      this.addTrackToPlaylist(state.item, playlistId).subscribe((result:any)=>{
        if(this.currentTrack != undefined)
        {
          if(result == "success" && this.currentTrack != undefined){
            this.currentTrack.trackState = TrackState.AddedToPlaylist;
          }else if(result=="exists"){
            this.currentTrack.trackState = TrackState.AlreadyOnPlaylist;
          }
        }
      });
    }
    else
    {
      if(this.currentTrack != undefined)
        this.currentTrack.trackState = TrackState.NotOnPlaylist;
    }
  }
  autoRemove(state: PlayingState){

  }
}