import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ConfigurationComponent } from './configuration/configuration.component';
import { HistoryComponent } from './history/history.component';
import { ConfiguratorService } from './services/configurator.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  //directives: [ConfigurationComponent]
})
export class AppComponent {

  @ViewChild("configComponent", { read: ViewContainerRef }) private configRef!: ViewContainerRef;
  @ViewChild("configDrawer") private configDrawer!: MatSidenav;

  @ViewChild("historyComponent", { read: ViewContainerRef }) private historyRef!: ViewContainerRef;
  @ViewChild("historyDrawer") private historyDrawer!: MatSidenav;

  constructor(private config: ConfiguratorService) {
    // Enable background mode
    if (Capacitor.isNativePlatform())
    {
      BackgroundMode.setDefaults({
        title: "Spadd is adding tracks",
        resume: true,
        text: "Loading playlist",
        icon: "icon"
      });

      App.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          return;
        }
        const conf = this.config.loadConfig();
        if (conf.autoAdd || conf.autoRemove)
          BackgroundMode.enable();
        else
          BackgroundMode.disable();
      });

      BackgroundMode.on("activate").subscribe(() => {
        BackgroundMode.disableBatteryOptimizations();
      })
    }
  }

  title = 'spotify-auto-adder'
  ngAfterViewInit() {
    import('./configuration/configuration.component').then(() => {
      const compRef = this.configRef.createComponent(ConfigurationComponent).instance;
      compRef.closedEvent.subscribe(() => {
        this.configDrawer.toggle();
        compRef.saveConfiguration();
      })
    });

    import('./history/history.component').then(() => {
      const compRef = this.historyRef.createComponent(HistoryComponent).instance;
      compRef.closedEvent.subscribe(() => {
        this.historyDrawer.toggle();
      })
    });
  }
}

/* document.addEventListener('deviceready', function () {
  // Android customization 

  BackgroundMode.setDefaults({ text: 'Doing heavy tasks.' });

  // Enable background mode
  BackgroundMode.enable();
  BackgroundMode.disableBatteryOptimizations();
}, false); */