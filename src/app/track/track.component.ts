import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../models/image.model';
import { Track } from '../models/track.model';
import { SpotifyService } from '../services/spotify.service';


@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {

  @Input() showProgress : boolean = true;
  @Input() track: Track|undefined;
  protected songProgress:number = 0;
  constructor(private spotify: SpotifyService) {
      spotify.refresher.subscribe(()=>{
        spotify.getSongProgress().subscribe((amount:number)=>{
          if(this.showProgress)
          {
            this.songProgress = amount;
            console.log(amount);
          }
          //this.currentTrackImage = this.track?.images[0];
        })
      })
   }

  ngOnInit(): void {
  }

/*   updateSongInfo(progress: number, track: Track)
  {
    this.songProgress = progress;//(state.progress_ms/track.duration_ms)*100;
    this.currentTrackImage = track.album.images.length > 0 ? track.album.images[0] : undefined;
  } */
}
