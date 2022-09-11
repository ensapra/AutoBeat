import { Component, OnInit } from '@angular/core';
import { Track } from '../models/track.model';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  public RecentlyPlayed: Array<Track> | undefined;
  constructor(private spotify: SpotifyService) { 
    spotify.getRecentlyPlayed(20).subscribe((data:any)=>{
      console.log(data)
      this.RecentlyPlayed = data;
    })
  }

  ngOnInit(): void {
  }

}
