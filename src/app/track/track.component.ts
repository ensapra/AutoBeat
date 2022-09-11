import { Component, OnInit } from '@angular/core';
import { Image } from '../models/image.model';
import { Track } from '../models/track.model';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {

  protected currentTrack: Track|undefined;
  protected currentTrackImage: Image|undefined;
  protected songProgress:number = 0;

  constructor(private track: Track) {
    this.currentTrack = track;
   }

  ngOnInit(): void {
  }

  updateSongInfo(progress: number, track: Track)
  {
    this.songProgress = progress;//(state.progress_ms/track.duration_ms)*100;
    this.currentTrackImage = track.album.images.length > 0 ? track.album.images[0] : undefined;
  }
}
