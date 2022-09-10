import { Injectable } from '@angular/core';
import { AppSettings } from 'src/config';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpRequest, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Router } from '@angular/router';
import { SpotifyAuthorizationValues, SpotifyAuthValStorage } from '../models/auth.model';
import { pipe } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthorizationService {

  private clientId: string = AppSettings.Client_ID;
  private clientSecret: string = AppSettings.Client_Secret;
  private scope = AppSettings.Scopes;
  private redirectUri = AppSettings.RedirectUri;

  public authorizationValues: SpotifyAuthorizationValues|undefined;

  constructor(private http: HttpClient) { 
    //this.authorizationValues = this.authorize();
  }
  public authorize()
  {
    let accessTK = localStorage.getItem("access_token");
    let refreshTK = localStorage.getItem("refresh_token");
    if(refreshTK == null || accessTK == null)
      this.fetchCode();
    else
      return new SpotifyAuthValStorage(accessTK, refreshTK)
    return undefined;
  }

  fetchCode()
  {
    let url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=code';
    url += '&client_id=' + this.clientId;
    url += '&scope=' + this.scope;
    url += '&redirect_uri=' +encodeURI(this.redirectUri);
    url += '&state=authored';
    window.location.href = url;
  }

  fetchAccessToken(code: any){
    const params = new HttpParams({
      fromObject: {
        grant_type: "authorization_code",
        code : code,
        redirect_uri : encodeURI(this.redirectUri),
      }
    });
    console.log(params);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
      })
    };
    
    fetch('https://accounts.spotify.com/api/token', {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code : code,
        redirect_uri : encodeURI(this.redirectUri),
      }),
    }).then(
      (value: Response) => {
        if(value.status == 200)
        {
          value.json().then(data => {
            let acces;
            let refresh;
            if (data.access_token != undefined ){
                localStorage.setItem("access_token", data.access_token);
                acces = data.access_token;
            }
            if ( data.refresh_token  != undefined ){
                localStorage.setItem("refresh_token", data.refresh_token);
                refresh = data.refresh_token;
            }
            this.authorizationValues = new SpotifyAuthValStorage(acces, refresh);
          });
        }
      }
    );
    /* let request = new HttpRequest("POST",'https://accounts.spotify.com/api/token',params, httpOptions)
    this.http.post('https://accounts.spotify.com/api/token', params, httpOptions)
      .subscribe(
        (res: any) => {
          console.log(res);
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('refresh_token', res.refresh_token);
        },
        err => console.log(err)
      ); */

/*     let params = new HttpParams({
      fromObject:{
        grant_type: 'authorization_code',
        code : code,
        redirect_uri : encodeURI(this.redirectUri),
        client_id : this.clientId,
        client_secret:this.clientSecret
      }})
 */
/*     let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(this.redirectUri);
    body += "&client_id=" + this.clientId;
    body += "&client_secret=" + this.clientSecret; */
    //this.callAuthorizationApi(params);
  }
  refreshAccessToken(){
/*     let body = "grant_type=refresh_token";
    body += "&refresh_token=" + this.refreshAccessToken;
    body += "&client_id=" + this.clientId; */
    console.log("refreshing token");
    let params = new HttpParams({
      fromObject: {
        grant_type: "refresh_token",
        refresh_token: this.authorizationValues != undefined ?  this.authorizationValues.refresh_token : "",
        client_id : this.clientId,
      }})
    this.callAuthorizationApi(params);
  }

/*   callAuthorizationApi(body: string){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://accounts.spotify.com/api/token", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(this.clientId + ":" + this.clientSecret));
    xhr.send(body);
    console.log(xhr);
    xhr.onload = () => {
      this.handleAuthorizationResponse;
    }
}

handleAuthorizationResponse(this: XMLHttpRequest){
    if (this.status == 200 ){
        var data = JSON.parse(this.responseText);
        var data = JSON.parse(this.responseText);
        let acces;
        let refresh;
        if ( data.access_token != undefined ){
            localStorage.setItem("access_token", data.access_token);
            acces = data.access_token;
        }
        if ( data.refresh_token  != undefined ){
            localStorage.setItem("refresh_token", data.refresh_token);
            refresh = data.refresh_token;
        }
        return new SpotifyAuthValStorage(acces, refresh);
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
        return undefined;
    }
} */
callAuthorizationApi(param: HttpParams){
    let headerOptions = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(this.clientId + ":" + this.clientSecret)
    });
    this.http.post("https://accounts.spotify.com/api/token", param,{headers: headerOptions})
    .pipe(catchError(err =>{
      localStorage.setItem("access_token","");
      localStorage.setItem("refresh_token","");
      throw err;
    })).subscribe((results:any)=>{
    //console.log(results);
    }
    );
    /* .pipe(catchError(err => {
      console.log(err);
      localStorage.setItem("access_token","");
      localStorage.setItem("refresh_token","");
      throw err;
    }))
    .subscribe(
      results =>{
        if ( results.access_token != undefined ){
          localStorage.setItem("access_token",results.access_token);
        }
        if ( results.refresh_token  != undefined ){
            localStorage.setItem("refresh_token",results.refresh_token);
        }
        this.authorizationValues = results;
      }) */
  }
}