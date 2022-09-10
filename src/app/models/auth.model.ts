export interface SpotifyAuthorizationValues{
    access_token: string;
    refresh_token: string;
    expires_in: number; 
  }
  export class SpotifyAuthValStorage implements SpotifyAuthorizationValues
  {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    constructor(private acces_tokenpr: string, private refresh_tokenpr: string)
    {
      this.access_token = acces_tokenpr;
      this.refresh_token = refresh_tokenpr;
      this.expires_in = 0;
    }
  }