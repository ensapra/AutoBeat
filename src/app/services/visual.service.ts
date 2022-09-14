import { Injectable } from '@angular/core';
import Vibrant from 'node-vibrant';
import { Palette } from 'node-vibrant/lib/color';
import { Subscription } from 'rxjs';
import { PlayingState } from '../models/playingstate.model';
import { Track } from '../models/track.model';
import { AnimatorService } from './animator.service';
import { SpotifyService } from './spotify.service';

@Injectable({
  providedIn: 'root'
})
export class VisualService {

  private palette:Palette|undefined;
  constructor(private spotify:SpotifyService, private anim:AnimatorService) { 
    this.spotify.onChangeTrack.subscribe(() => this.updatePalette())
  }

  bkgColor():any {
    return { 'background-image': 'linear-gradient(to bottom right,'+this.anim.currentLeft+', '+this.anim.currentRight+')'};
  }
  
  progressContainerSettings():any
  {
    if (this.palette?.Muted) {
      return { 'background-color': this.palette.Muted.getHex()};
    } else {
      return { 'background-color': '#00000'};
    }
  }
  
  progressSettings():any{
    const progress = this.spotify.getTrackProgress();
    if (this.palette?.DarkMuted) {
      return { 'background-color': this.palette.DarkMuted.getHex(), 'width' : progress+"%"};
    } else {
      return { 'background-color': '#00000', 'width' : progress+"%"};
    }
  }

  updatePalette()
  {
      let imageUrl = this.spotify.getTrackImageURL();
      Vibrant.from(imageUrl).getPalette((err, palette) => {
        this.palette = palette;
        if(palette != undefined && palette.DarkMuted != undefined && palette.Muted != undefined && this.spotify.playState != undefined)
          this.anim.animateColors(palette.DarkMuted.getHex(), palette.Muted.getHex());
        else
          this.anim.animateColors("#537895 " , "#09203F");
      });
    }
  }
