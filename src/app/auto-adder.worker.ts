/* /// <reference lib="webworker" />


self.addEventListener('message', ( data : any ) => {
  setTimeout(function(){checkNextStep()}, 2000);
  self.postMessage("Checking");  

});


function checkNextStep(){
  const conf = config.loadConfig();
  let state = service.playState;
  let currentTrack = service.currentTrack;

  if(currentTrack?.trackState == 5)
  {
    if(state != undefined && currentTrack != undefined)
    {
      const progress = (state.progress_ms/currentTrack.duration_ms)*100;
      if(state != null)
      {
        if(conf.autoAdd && progress > conf.whenToAdd)
          addCurrentSong(state);
        
      }
    }
  }
  setTimeout(function(){checkNextStep()}, 2000);
}
function addCurrentSong(state: any){
  const val = this.isPlayingPlaylist(state);
  if(val.isPlay){
    this.addTrackToPlaylist(state.item, val.id).subscribe((result:any)=>{
      if(this.currentTrack != undefined)
      {
        if(result == "success" && this.currentTrack != undefined){
          this.currentTrack.trackState = TrackState.AddedToPlaylist;
        }else if(result=="exists"){
          this.currentTrack.trackState = TrackState.AlreadyOnPlaylist;
        }
      }
    });
  }
}
function isPlayingPlaylist(state: PlayingState|undefined){
  if(state == undefined || state.context == undefined || state.context.uri == undefined)
    return {isPlay: false, id: ""};
  const parts = state.context.uri.split(":");
  const playlistId = parts[2];
  return {isPlay: parts[1] == "playlist", id: playlistId};
}

function isTrackInPlaylist(trackId:string, playlistId:string) : Observable<boolean>
{
  const url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks"
  return this.http.get(url).pipe(switchMap((data:any)=>{
    let found: boolean = false;
    data.items.forEach((element:any) => {
      found = found || element.track.id === trackId;
    });
    return of(found);
  }));
} */