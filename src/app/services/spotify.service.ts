import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode';
import { Capacitor } from '@capacitor/core';
import { delay, interval, map, Observable, of, repeat, Subject, Subscription, switchMap, timer } from 'rxjs';
import { PlayingState } from '../models/playingstate.model';
import { Playlist } from '../models/playlist.model';
import { Track, TrackState } from '../models/track.model';
import { ConfiguratorService } from './configurator.service';
import { SimpleTrack } from '../models/simpletrack.model';


@Injectable({
  providedIn: 'root'
})

export class SpotifyService {

  public currentTrack: Track | undefined;
  public playState: PlayingState | undefined;
  public selectedPlaylsit: Playlist | undefined;
  protected playingPlaylist: Playlist | undefined;

  public targetPlaylist: Playlist | undefined;
  private previousPlaylist: Playlist |undefined;

  public onChangeTrack: Subject<{ previousTrack: Track | undefined, state: PlayingState | undefined, currentTrack: Track | undefined }> = new Subject();
  private notPlayingTracks: number = 0;

  private onUpdatePlayState: Subscription | undefined;
  constructor(private http: HttpClient, private config: ConfiguratorService) {
  }

  public startToUpdate()
  {
    if(this.onUpdatePlayState == undefined)
      this.onUpdatePlayState = interval(2000).subscribe(()=>this.updatePlayState().subscribe());
  }

  public stopToUpdate()
  {
    this.onUpdatePlayState?.unsubscribe();
  }

  updatePlayState() {
    return this.getPlayState().pipe(map((data: PlayingState) => {
      this.playState = data != null ? data : undefined;
      if(data != undefined && data.item != undefined)
      {
        if(this.currentTrack?.id != data.item.id)
        {
          let item = this.isPlayingPlaylist(this.playState);
          data.item.trackState = TrackState.NoPlaylistPlaying;
          this.getPlaylist(item.id).subscribe((playlist: Playlist) => {
            this.playingPlaylist = playlist;
            this.refreshTargetPlaylist();
          })

          let array: Array<SimpleTrack> = this.getRecentlyPlayed();
          if (this.currentTrack != undefined)
          {
            let st = new SimpleTrack();
            st.playlistName = this.currentTrack.addedAtPlaylist?.name;
            st.trackState = this.currentTrack.trackState;
            st.name = this.currentTrack.name;
            st.artists = this.currentTrack.artists;
            st.images = this.currentTrack.album.images;
            st.id = this.currentTrack.id;
            array.push(st);
          }
          this.saveHistory(array);

          const previousTrack = this.currentTrack;
          this.currentTrack = data.item;
          if (!Capacitor.isNativePlatform() || !BackgroundMode.isActive()) {
            this.onChangeTrack.next({ previousTrack: previousTrack, state: this.playState, currentTrack: this.currentTrack }); 
          }
        }
      }
      else
        this.currentTrack = undefined;

      if (Capacitor.isNativePlatform() && BackgroundMode.isActive()) 
      {
        if(this.previousPlaylist != this.targetPlaylist)
        {
          if(this.targetPlaylist == undefined)
          {
            BackgroundMode.configure({
              text: "Not playing a playlist"
            })
          }
          else
          {
            BackgroundMode.configure({
              text: "The target playlist is " + this.targetPlaylist?.name
            })
          }
        }
        if(this.currentTrack == undefined)
          this.notPlayingTracks++;
        else
          this.notPlayingTracks = 0;

        if(this.notPlayingTracks >40)
          BackgroundMode.disable();
      } 

      this.previousPlaylist = this.targetPlaylist;

      if (this.currentTrack?.trackState == TrackState.NotOnPlaylist)
        this.checkNextStep(this.currentTrack, data);
      return this.playState;
    }));
  }

  updateCurrentTrackState(playlist: Playlist | undefined) {
    if (this.currentTrack == undefined)
      return;
    if (playlist == undefined)
      this.currentTrack.trackState = TrackState.NoPlaylistPlaying;
    else {
      if (this.currentTrack.trackState != TrackState.AddedToPlaylist && this.currentTrack.trackState != TrackState.RemovedFromPlaylist) {
        this.isTrackInPlaylist(this.currentTrack.id, playlist.id).subscribe((isInPlaylist: boolean) => {
          if (this.currentTrack == undefined)
            return;

          if (isInPlaylist)
            this.currentTrack.trackState = TrackState.AlreadyOnPlaylist;
          else
            this.currentTrack.trackState = TrackState.NotOnPlaylist;

          this.currentTrack.addedAtPlaylist = playlist;
        })
      }
    }
  }

  getPlayState()
  {
    const url = "https://api.spotify.com/v1/me/player/currently-playing";
    return this.http.get<PlayingState>(url);
  }

  getTrackProgress() {
    if (this.playState != undefined && this.currentTrack != undefined)
      return (this.playState?.progress_ms / this.currentTrack?.duration_ms) * 100;
    return 0;
  }

  getPlaylistImage() {
    if (Capacitor.isNativePlatform() && BackgroundMode.isActive())
      return ""

    if (this.targetPlaylist != undefined)
      return this.targetPlaylist?.images[0].url;
    else
      return "";
  }

  getPlaylists() {
    const url = "https://api.spotify.com/v1/me/playlists?limit=50";
    return this.http.get(url)
  }

  getRecentlyPlayed() {
    let json = localStorage.getItem("previousTracks");
    if (json != null)
      return JSON.parse(json);
    else
      return new Array<SimpleTrack>();
  }


  saveHistory(array: Array<SimpleTrack>) {
    array = array.filter((_, index) => index > array.length - 20);
    localStorage.setItem("previousTracks", JSON.stringify(array));
  }


  isPlayingPlaylist(state: PlayingState | undefined) {
    if (state == undefined || state.context == undefined || state.context.uri == undefined)
      return { isPlay: false, id: "" };
    const parts = state.context.uri.split(":");
    const playlistId = parts[2];
    return { isPlay: parts[1] == "playlist", id: playlistId };
  }

  isTrackInPlaylist(trackId: string, playlistId: string): Observable<boolean> {
    const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks"
    return this.http.get(url).pipe(switchMap((data: any) => {
      let found: boolean = false;
      data.items.forEach((element: any) => {
        found = found || element.track.id === trackId;
      });
      return of(found);
    }));
  }


  refreshTargetPlaylist() {
    let config = this.config.configObject;
    if (!config.custom_enabled)
      this.targetPlaylist = this.playingPlaylist;
    else
      this.targetPlaylist = this.selectedPlaylsit;

    this.updateCurrentTrackState(this.targetPlaylist);
  }

  private getPlaylist(id: string | undefined) {
    const url = "https://api.spotify.com/v1/playlists/" + id;
    return this.http.get<Playlist>(url);
  }


  addTrackToPlaylist(track: Track, playlistId: string) {
    let url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    url += "?uris=" + encodeURI(track.uri);
    return this.isTrackInPlaylist(track.id, playlistId).pipe(switchMap((resultObs) => {
      if (!resultObs)
        return this.http.post(url, "").pipe(switchMap((result: any) => {
          return of(result.snapshot_id ? "success" : "failure");
        }));
      else
        return of("exists");
    }))
  }

  checkNextStep(currentTrack: Track, state: PlayingState) {
    const progress = (state.progress_ms / currentTrack.duration_ms) * 100;
    if (state != null && this.currentTrack != undefined) {
      const conf = this.config.configObject;
      if (conf.autoAdd && progress > conf.whenToAdd)
        this.addTrackToTargetPlaylist(this.currentTrack);

      if (conf.autoRemove && progress > conf.whenToRemove)
        this.autoRemove(state);
    }
  }

  addTrackToTargetPlaylist(track: Track) {
    if (this.targetPlaylist != undefined) {
      const playlistId = this.targetPlaylist.id;
      this.addTrackToPlaylist(track, playlistId).subscribe((result: any) => {
        if (this.currentTrack != undefined) {
          if (result == "success" && this.currentTrack != undefined) {
            this.currentTrack.trackState = TrackState.AddedToPlaylist;
          } else if (result == "exists") {
            this.currentTrack.trackState = TrackState.AlreadyOnPlaylist;
          }
          this.currentTrack.addedAtPlaylist = this.targetPlaylist!;
        }
      });
    }
    else {
      if (this.currentTrack != undefined)
        this.currentTrack.trackState = TrackState.NotOnPlaylist;
    }
  }
  autoRemove(state: PlayingState) {

  }
}