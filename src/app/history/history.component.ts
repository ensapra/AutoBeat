import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Track } from '../models/track.model';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  public RecentlyPlayed: Array<Track> | undefined;
  private subs:Subscription;
  constructor(private spotify: SpotifyService) { 
    this.subs = spotify.onChangeTrack.subscribe(()=>{
      spotify.getRecentlyPlayed(20).subscribe((data:any)=>{
        this.RecentlyPlayed = data;
      })
    })
  }

  ngOnInit(): void {
    this.spotify.getRecentlyPlayed(20).subscribe((data:any)=>{
      console.log(data);
      this.RecentlyPlayed = data;
    })
  }
  ngOnDestroy(){
    this.subs.unsubscribe();
  }
}
