import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../models/image.model';
import { PlayingState } from '../models/playingstate.model';
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
   }

  ngOnInit(): void {
  }

  updateTrackProgress(progress: number)
  {
    this.songProgress = progress;
  }
}
