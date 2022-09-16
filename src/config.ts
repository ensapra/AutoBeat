export class AppSettings{
    public static Client_ID= "5210ad2cc0cd498f95fb856c90f44d5c";
    public static Client_Secret = "2a03f9d1b67a4aaf9e2946266cdbe2e9";
    public static RedirectUri = 'https://spotify-auto-add.web.app'
    public static Scopes = [
        //Listening History
        'user-read-recently-played',
        'user-top-read',
        'user-read-playback-position',
        //Spotify Connect
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        //Playlists
        'playlist-modify-public',
        'playlist-modify-private',
        'playlist-read-private',
        'playlist-read-collaborative',
        //Library
        'user-library-modify',
        'user-library-read',
      ];
}