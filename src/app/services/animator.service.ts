import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimatorService {
  public currentLeft: string = "#360940";
  public currentRight: string = "#F05F57";

  constructor() { }

  animateColors(targetLeft: string, targetRight: string) {
    let calls = 0;
    let leftColor = this.currentLeft;
    let rightColor = this.currentRight;
    let timeFrame = setInterval(() => {
      this.currentLeft = lerpColor(leftColor, targetLeft, calls / 50);
      this.currentRight = lerpColor(rightColor, targetRight, calls / 50);
      if (calls === 50)
        clearInterval(timeFrame);
      calls++;
    }, 16.667);
  }
}

const lerpColor = function (a: string, b: string, amount: number) {
  var ah = parseInt(a.replace(/#/g, ''), 16),
    ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
    bh = parseInt(b.replace(/#/g, ''), 16),
    br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
    rr = ar + amount * (br - ar),
    rg = ag + amount * (bg - ag),
    rb = ab + amount * (bb - ab);
  return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}