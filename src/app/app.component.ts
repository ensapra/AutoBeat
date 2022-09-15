import { Component, ViewChild } from '@angular/core';
import { ConfigurationComponent } from './configuration/configuration.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  //directives: [ConfigurationComponent]
})
export class AppComponent {

  @ViewChild(ConfigurationComponent) child!:ConfigurationComponent;
  constructor(){
  }
  title = 'spotify-auto-adder'
  saveConfig()
  {
    this.child.saveConfiguration();
  }
}
