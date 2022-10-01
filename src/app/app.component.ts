import { Component, ViewChild, ViewContainerRef,NgZone } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ConfigurationComponent } from './configuration/configuration.component';
import { HistoryComponent } from './history/history.component';
import { App } from '@capacitor/app';
import { BackgroundTask, BackgroundTaskPlugin, FinishOptions } from '@capawesome/capacitor-background-task';
import { SpotifyService } from './services/spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  //directives: [ConfigurationComponent]
})
export class AppComponent {

  @ViewChild("configComponent", {read: ViewContainerRef}) private configRef!: ViewContainerRef;
  @ViewChild("configDrawer") private configDrawer!: MatSidenav;

  @ViewChild("historyComponent", {read: ViewContainerRef}) private historyRef!: ViewContainerRef;
  @ViewChild("historyDrawer") private historyDrawer!: MatSidenav;

  private taskId:any;

  constructor(private spotify:SpotifyService) {
    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        BackgroundTask.finish(this.taskId);
        return;
      }
      // The app state has been changed to inactive.
      // Start the background task by calling `beforeExit`.
      const taskId = await BackgroundTask.beforeExit(async () => {
        // Run your code...
        spotify.refresher.subscribe(()=> this.spotify?.getPlayingState().subscribe())
        this.taskId = {taskId};
        // Finish the background task as soon as everything is done.
      });
    });
  }

  title = 'spotify-auto-adder'
  ngAfterViewInit() {
    import('./configuration/configuration.component').then(() => {
      const compRef = this.configRef.createComponent(ConfigurationComponent).instance;
      compRef.closedEvent.subscribe(()=>{
        this.configDrawer.toggle();
        compRef.saveConfiguration();
      })
    });  

    import('./history/history.component').then(() => {
      const compRef = this.historyRef.createComponent(HistoryComponent).instance;
      compRef.closedEvent.subscribe(()=>{
        this.historyDrawer.toggle();
      })
    });
  }
}
