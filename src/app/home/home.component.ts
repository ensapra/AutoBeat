import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Palette } from 'node-vibrant/lib/color';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { Playlist } from '../models/playlist.model';
import { TrackState } from '../models/track.model';
import { User } from '../models/user.model';
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
  @ViewChild('targetImage') targetElement: any;

  protected user: User | undefined
  //protected playlist: Playlist|undefined;  
  availablePlaylists: Observable<Playlist[]> | undefined;
  myControl = new FormControl('');
  protected palette: Palette | undefined;
  protected selectedIndex;
  constructor(private auth: AuthorizationService, protected spotify: SpotifyService, protected visual: VisualService, protected config: ConfiguratorService, private zone: NgZone) {
    if (window.location.search.length > 0) {
      this.handleRedirect().subscribe(
        () => this.startServiceUpdate()
      );
    }
    else
      this.startServiceUpdate();

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        const search = event.url.split("://").pop();
        const urlParams = new URLSearchParams(search);
        const code = urlParams.get('code')
        this.auth.fetchAccessToken(code).subscribe(() =>
          this.startServiceUpdate());
      });
    });

    this.selectedIndex = this.config.configObject.custom_enabled ? 1 : 0;
  }

  ngOnInit(): void {
  }


  startServiceUpdate() {
    if (this.auth.authorizationValues)
    {
      this.spotify.startToUpdate();
      this.spotify.getPlaylists().subscribe((data: any) => {
        const playlists = data.items as Playlist[];
        this.availablePlaylists = this.myControl.valueChanges.pipe(
          startWith(''),
          map(
            (value => {
              return this._filter(value || '', playlists)
            })))
      })
    }
  }


  private _filter(value: string, existing: Playlist[]): Playlist[] {
    const filterValue = value.toLowerCase();
    return existing.filter(playlist => playlist.name.toLowerCase().includes(filterValue));
  }



  addCurrentSong() {
    if (this.spotify.currentTrack != undefined)
      this.spotify.addTrackToTargetPlaylist(this.spotify.currentTrack);
  }

  getTrackImage() {
    return this.visual.getBestImageUrl(this.spotify.currentTrack?.album.images, this.targetElement?.nativeElement.offsetHeight)
  }

  changeMode(custom: any) {
    let config = this.config.configObject;
    config.custom_enabled = custom.index == 1;
    this.config.saveConfiguration(config);
    this.spotify.refreshTargetPlaylist();
    return custom.index;
  }

  selectPlaylistOption(value: any) {
    this.availablePlaylists?.subscribe((playlist: Playlist[]) => {
      const selectedPlaylist = playlist.find(a => a.name == value);
      if (this.spotify.selectedPlaylsit != selectedPlaylist) {
        this.spotify.selectedPlaylsit = selectedPlaylist;
        this.spotify.refreshTargetPlaylist();
      }
    })
  }

  canAdd(): boolean {
    return this.spotify.currentTrack?.trackState != TrackState.NotOnPlaylist;
  }

  handleRedirect(): Observable<any> {
    let code = this.getCode();
    return this.auth.fetchAccessToken(code);
  }

  getCode() {
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0) {
      const urlParams = new URLSearchParams(queryString);
      code = urlParams.get('code')
    }
    return code;
  }
}