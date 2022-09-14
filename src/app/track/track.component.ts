import { Component, OnInit, Input } from '@angular/core';
import Vibrant from 'node-vibrant';
import { Image } from '../models/image.model';
import { PlayingState } from '../models/playingstate.model';
import { Track } from '../models/track.model';
import { SpotifyService } from '../services/spotify.service';
import { VisualService } from '../services/visual.service';


@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {

  @Input() showProgress : boolean = true;
  @Input() track: Track|undefined;
  protected trackImageURL:string|undefined;
  protected leftColor:string|undefined;
  protected rightColor:string|undefined;
  constructor(private visual:VisualService) {
    this.leftColor = visual.defaultLeft;
    this.rightColor = visual.defaultRight;
   }

  ngOnInit(): void {
    this.trackImageURL = this.track?.album.images[1].url;
    if(this.trackImageURL != undefined)
    {
      Vibrant.from(this.trackImageURL).getPalette((err,palette)=>{
        this.leftColor = palette?.DarkMuted?.getHex();
        this.rightColor = palette?.Muted?.getHex();
      })
    }
  }
  bkgColor():any{
    return { 'background-image': 'linear-gradient(to bottom right,'+this.leftColor+', '+this.rightColor +')'};
  }
}
