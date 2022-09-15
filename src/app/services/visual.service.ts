import { Injectable } from '@angular/core';
import Vibrant from 'node-vibrant';
import { Palette } from 'node-vibrant/lib/color';
import { AnimatorService } from './animator.service';
import { SpotifyService } from './spotify.service';

@Injectable({
  providedIn: 'root'
})
export class VisualService {

  public defaultLeft: string = "#360940";
  public defaultRight:string = "#F05F57";  

  private palette:Palette|undefined;
  constructor(private spotify:SpotifyService, private anim:AnimatorService) { 
    this.spotify.onChangeTrack.subscribe(() => this.updatePalette(this.spotify.getTrackImageURL()))
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
  getButtonColor():any{
    if (this.palette?.LightVibrant) {
      return { 'color': this.palette.LightVibrant.getHex()};
    } else {
      return { 'color': '#00000'};
    }
  }
  updatePalette(imageUrl: string)
  {
      Vibrant.from(imageUrl).getPalette((err, palette) => {
        this.palette = palette;
        if(palette != undefined && palette.DarkMuted != undefined && palette.Muted != undefined && this.spotify.playState != undefined)
          this.anim.animateColors(palette.DarkMuted.getHex(), palette.Muted.getHex());
        else
          this.anim.animateColors(this.defaultLeft, this.defaultRight);
      });
    }
  }
