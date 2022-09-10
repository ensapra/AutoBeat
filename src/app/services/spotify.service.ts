import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthorizationService } from './authorization.service';
import { User } from '../models/user.model';
import { Track } from '../models/track.model';
import { PlayingState } from '../models/playingstate.model';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  constructor(private http: HttpClient, private auth: AuthorizationService) { }
  
  getUserInfo(){
    let http = "https://api.spotify.com/v1/me";
    return this.http.get<User>(http);

  }

  getCurrentlyPlaying(){
    let url = 	"https://api.spotify.com/v1/me/player/currently-playing";
    return this.http.get<PlayingState>(url);
  }

  getTrackExtended(id: string)
  {
    let url = "https://api.spotify.com/v1/tracks/" + id;
    return this.http.get<Track>(url);
  }
}