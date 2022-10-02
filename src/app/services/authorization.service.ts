import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { from, Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AppSettings } from 'src/config';
import { SpotifyAuthValStorage } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})

export class AuthorizationService {

  private clientId: string = AppSettings.Client_ID;
  private clientSecret: string = AppSettings.Client_Secret;
  private scope = AppSettings.Scopes;

  public authorizationValues: SpotifyAuthValStorage | undefined;

  constructor(private router: Router) {
    this.authorize();
  }

  getRedirectDirection(): string {
    if (Capacitor.isNativePlatform())
      return AppSettings.AppScheme;
    else
      return AppSettings.RedirectUri;
  }
  public authorize() {
    let accessTK = localStorage.getItem("access_token");
    let refreshTK = localStorage.getItem("refresh_token");
    if (accessTK == null || refreshTK == null)
      this.fetchCode();
    else
      this.authorizationValues = new SpotifyAuthValStorage(accessTK, refreshTK)
  }

  fetchCode() {
    if (window.location.search.length <= 0) {
      let url = 'https://accounts.spotify.com/authorize';
      url += '?response_type=code';
      url += '&client_id=' + this.clientId;
      url += '&scope=' + this.scope;
      url += '&redirect_uri=' + encodeURI(this.getRedirectDirection());
      url += '&state=authored';
      window.location.href = url;
    }
  }

  fetchAccessToken(code: any): Observable<any> {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: encodeURI(this.getRedirectDirection()),
    });
    return this.callAuthorizationApi(params);
  }

  refreshAccessToken(): Observable<any> {
    let refreshTK = localStorage.getItem("refresh_token");
    let params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshTK != null ? refreshTK : "",
      client_id: this.clientId,
    });
    return this.callAuthorizationApi(params);
  }


  callAuthorizationApi(params: URLSearchParams): Observable<any> {
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
    };

    return from(fetch('https://accounts.spotify.com/api/token', {
      method: "POST",
      headers: headers,
      body: params,
    })).pipe(
      filter((value: Response) => value.status === 200),
      switchMap((value: Response) => {
        return value.json().then(data => {
          let acces;
          let refresh;
          if (data.access_token != undefined) {
            localStorage.setItem("access_token", data.access_token);
            acces = data.access_token;
          }
          if (data.refresh_token != undefined) {
            localStorage.setItem("refresh_token", data.refresh_token);
            refresh = data.refresh_token;
          }
          this.authorizationValues = new SpotifyAuthValStorage(acces, refresh);
          this.router.navigate([""]);
        });
      }
      ));
  }
}
