import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router, Event as NavigationEvent } from '@angular/router';
import { map, Observable,interval } from 'rxjs';
import { AppSettings } from 'src/config';
import { PlayingState } from '../models/playingstate.model';
import { Track } from '../models/track.model';
import { User } from '../models/user.model';
import { AuthorizationService } from '../services/authorization.service';
import { SpotifyService } from '../services/spotify.service';

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
  constructor(private auth: AuthorizationService, private router: Router, private apiRequester: SpotifyService) {
    }
  
  ngOnInit(): void {
    if(window.location.search.length > 0){
      this.handleRedirect();
    }
    else{  
      this.apiRequester.getUserInfo().subscribe((data:User) =>
      {
        this.user = data;
        this.userImageUrl = data.images[0].url;
        this.enableLayout();
      });
    }
  }

  authorize()
  {
    console.log("asd");
    this.auth.authorize();
  }
  enableLayout()
  {
    interval(2000).subscribe(() =>
    this.apiRequester.getCurrentlyPlaying().subscribe((playingData:PlayingState) =>
    {
      this.playingState = playingData;
      this.apiRequester.getTrackExtended(this.playingState.item.id).subscribe((trackData:Track) =>{
        this.currentTrack = trackData;
        console.log(this.currentTrack);
        this.updateSongProgress(playingData, trackData);
      });
    })
  )
  }
  updateSongProgress(state: PlayingState, track: Track)
  {
    this.songProgress = (state.progress_ms/track.duration_ms)*100;
  }

  handleRedirect(){
    let code = this.getCode();
    this.auth.fetchAccessToken(code);
    window.history.pushState("", "", AppSettings.RedirectUri);
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
