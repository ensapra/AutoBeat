import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { HistoryComponent } from './history/history.component';
import {MatCardModule} from '@angular/material/card';
import {MatSliderModule} from '@angular/material/slider';

import {MatToolbarModule} from '@angular/material/toolbar';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpotifyHTTPInterceptorService } from './services/spotify-httpinterceptor.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { TrackComponent } from './track/track.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {MatAutocompleteModule} from '@angular/material/autocomplete';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ConfigurationComponent,
    HistoryComponent,
    TrackComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    HttpClientModule,
    MatCardModule,
    MatProgressBarModule,
    MatSliderModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatAutocompleteModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    RouterModule
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
