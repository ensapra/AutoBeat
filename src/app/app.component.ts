import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ConfigurationComponent } from './configuration/configuration.component';
import { HistoryComponent } from './history/history.component';

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


  constructor(){
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
/*     this.configSub = this.configDrawer.openedChange.subscribe(()=>{
      import('./configuration/configuration.component').then(() => {
        const compRef = this.configRef.createComponent(ConfigurationComponent).instance;
        compRef.closedEvent.subscribe(()=>{
          this.configDrawer.toggle();
          compRef.saveConfiguration();
        })
        this.configSub.unsubscribe();
      });  
    })
 */
    import('./history/history.component').then(() => {
      const compRef = this.historyRef.createComponent(HistoryComponent).instance;
      compRef.closedEvent.subscribe(()=>{
        this.historyDrawer.toggle();
      })
    });
/*     this.historySub = this.historyDrawer.openedChange.subscribe(()=>{
      import('./history/history.component').then(() => {
        const compRef = this.historyRef.createComponent(HistoryComponent).instance;
        compRef.closedEvent.subscribe(()=>{
          this.historyDrawer.toggle();
        })
        this.historySub.unsubscribe();
      });
    }) */
  }
}

