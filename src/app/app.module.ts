import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { HistoryComponent } from './history/history.component';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


import {MatToolbarModule} from '@angular/material/toolbar';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpotifyHTTPInterceptorService } from './services/spotify-httpinterceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavigationBarComponent,
    ConfigurationComponent,
    HistoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    HttpClientModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpotifyHTTPInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
