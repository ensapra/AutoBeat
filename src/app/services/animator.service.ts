import { Injectable } from '@angular/core';
import { Palette } from 'node-vibrant/lib/color';

@Injectable({
  providedIn: 'root'
})
export class AnimatorService {

  private leftColor: string = "#000000";
  private rightColor:string = "#ffffff";

  public currentLeft: string = "#000000";
  public currentRight:string = "#ffffff";

  constructor() { }

  animateColors(targetLeft:string, targetRight:string){
    
    let calls = 0;
    let timeFrame = setInterval(()=> {
      this.currentLeft = lerpColor(this.leftColor, targetLeft, calls/50);
      this.currentRight = lerpColor(this.rightColor, targetRight, calls/50);
      if(calls === 50) {
        this.leftColor = targetLeft;
        this.rightColor = targetRight;
        clearInterval(timeFrame);
      }
      calls++;
    }, 16.667);
  }
}

const lerpColor = function(a:string, b:string, amount:number) { 
  var ah = parseInt(a.replace(/#/g, ''), 16),
      ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
      bh = parseInt(b.replace(/#/g, ''), 16),
      br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
      rr = ar + amount * (br - ar),
      rg = ag + amount * (bg - ag),
      rb = ab + amount * (bb - ab);
  return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}