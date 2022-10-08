import { Injectable } from '@angular/core';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode';
import { Capacitor } from '@capacitor/core';
import Vibrant from 'node-vibrant';
import { Palette } from 'node-vibrant/lib/color';
import { Subscription } from 'rxjs';
import { Image } from '../models/image.model';
import { AnimatorService } from './animator.service';
import { SpotifyService } from './spotify.service';

declare const tinycolor: any;

export interface Color {
  name: string;
  hex: string;
  darkContrast: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VisualService {

  public defaultLeft: string = "#360940";
  public defaultRight: string = "#F05F57";

  primaryColorPalette: Color[] = [];
  accentColorPalette: Color[] = [];

  private palette: Palette | undefined;
  private onChangeTrack: Subscription;
  constructor(private spotify: SpotifyService, private anim: AnimatorService) {
    this.onChangeTrack=this.spotify.onChangeTrack.subscribe(() => this.updatePalette(this.getBestImageUrl(spotify.currentTrack?.album.images, 0)))
  }

  bkgColor(): any {
    return { 'background-image': 'linear-gradient(to bottom right,' + this.anim.currentLeft + ', ' + this.anim.currentRight + ')' };
  }

  progressContainerSettings(): any {
    if (this.palette?.LightVibrant) {
      return { 'background-color': this.palette.LightVibrant.getHex() };
    } else {
      return { 'background-color': '#00000' };
    }
  }

  progressSettings(): any {
    const progress = this.spotify.getTrackProgress();
    if (this.palette?.DarkVibrant) {
      return { 'background-color': this.palette.DarkVibrant.getHex(), 'width': progress + "%" };
    } else {
      return { 'background-color': '#00000', 'width': progress + "%" };
    }
  }

  getButtonColor(): any {
    if (this.palette?.LightVibrant) {
      return { 'color': this.palette.LightVibrant.getHex() };
    } else {
      return { 'color': '#00000' };
    }
  }

  updatePalette(imageUrl: string) {
    Vibrant.from(imageUrl).getPalette((err, palette) => {
      this.palette = palette;
      if (palette != undefined && palette.DarkMuted != undefined && palette.Muted != undefined && this.spotify.playState != undefined)
        this.anim.animateColors(palette.DarkMuted.getHex(), palette.Muted.getHex());
      else
        this.anim.animateColors(this.defaultLeft, this.defaultRight);
      this.savePrimaryColor();
      this.saveAccentColor();
    });
  }

  getBestImageUrl(array: Array<Image> | undefined, dim: number): string {
    if (Capacitor.isNativePlatform() && BackgroundMode.isActive())
      return ""
    if (array != undefined) {
      let i: number = array.length - 1;
      for (i; i >= 0; i--) {
        const width = array[i].width;
        const height = array[i].height;
        if (width > dim && height > dim)
          return array[i].url;
      }
      return array[0].url
    }
    return "../assets/picture-not-available.jpg";
  }

  savePrimaryColor() {
    if (this.palette?.Vibrant) {
      this.primaryColorPalette = computeColors(this.palette.Vibrant.getHex());
      for (const color of this.primaryColorPalette) {
        const key1 = `--theme-primary-${color.name}`;
        const value1 = color.hex;
        const key2 = `--theme-primary-contrast-${color.name}`;
        const value2 = color.darkContrast ? 'rgba(black, 0.87)' : 'white';
        document.documentElement.style.setProperty(key1, value1);
        document.documentElement.style.setProperty(key2, value2);
      }
    }
  }

  saveAccentColor() {
    if (this.palette?.DarkMuted) {
      this.accentColorPalette = computeColors(this.palette.DarkMuted.getHex());
      for (const color of this.accentColorPalette) {
        const key1 = `--theme-accent-${color.name}`;
        const value1 = color.hex;
        const key2 = `--theme-accent-contrast-${color.name}`;
        const value2 = color.darkContrast ? 'rgba(black, 0.87)' : 'white';
        document.documentElement.style.setProperty(key1, value1);
        document.documentElement.style.setProperty(key2, value2);
      }
    }
  }
}

function computeColors(hex: string): Color[] {
  return [
    getColorObject(tinycolor(hex).lighten(52), '50'),
    getColorObject(tinycolor(hex).lighten(37), '100'),
    getColorObject(tinycolor(hex).lighten(26), '200'),
    getColorObject(tinycolor(hex).lighten(12), '300'),
    getColorObject(tinycolor(hex).lighten(6), '400'),
    getColorObject(tinycolor(hex), '500'),
    getColorObject(tinycolor(hex).darken(6), '600'),
    getColorObject(tinycolor(hex).darken(12), '700'),
    getColorObject(tinycolor(hex).darken(18), '800'),
    getColorObject(tinycolor(hex).darken(24), '900'),
    getColorObject(tinycolor(hex).lighten(50).saturate(30), 'A100'),
    getColorObject(tinycolor(hex).lighten(30).saturate(30), 'A200'),
    getColorObject(tinycolor(hex).lighten(10).saturate(15), 'A400'),
    getColorObject(tinycolor(hex).lighten(5).saturate(5), 'A700')
  ];
}

function getColorObject(value: any, name: any): Color {
  const c = tinycolor(value);
  return {
    name: name,
    hex: c.toHexString(),
    darkContrast: c.isLight()
  };
}