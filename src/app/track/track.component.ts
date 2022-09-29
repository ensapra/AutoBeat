import { Component, OnInit, Input } from '@angular/core';
import Vibrant from 'node-vibrant';
import { Track } from '../models/track.model';
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
    this.trackImageURL = this.visual.getBestImageUrl(this.track?.album.images, 100);
    if(this.track != undefined){
      let i: number = this.track.album.images.length-1;
      for(i; i >= 0; i--)
      {
        const width = this.track.album.images[i].width;
        const height = this.track.album.images[i].height;
        if(width > 100 && height > 100)
        {
          this.trackImageURL = this.track?.album.images[i].url;
          break;
        }
      }
    }
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
