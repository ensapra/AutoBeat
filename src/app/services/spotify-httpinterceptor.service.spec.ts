import { TestBed } from '@angular/core/testing';

import { SpotifyHTTPInterceptorService } from './spotify-httpinterceptor.service';

describe('SpotifyHTTPInterceptorService', () => {
  let service: SpotifyHTTPInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyHTTPInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
