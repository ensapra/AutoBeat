import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyHTTPInterceptorService implements HttpInterceptor {

  constructor(private auth: AuthorizationService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //do whatever you want with the HttpRequest
    req = req.clone({ headers: this.getHeader() })

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          return this.auth.refreshAccessToken().pipe(
            mergeMap(() => next.handle(req.clone()))
          )
        }
        else
          throw err;
      }))
  }

  getHeader(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.auth.authorizationValues?.access_token
    })
  }
}
