import { Album } from "./albun.mode";
import { Artist } from "./artist.model";
import { Image } from "./image.model";
import { Playlist } from "./playlist.model";
import { Track } from "./track.model";

export class SimpleTrack {
    name: string;
    artists: Artist[];
    images: Image[];
    id: string;
    trackState: TrackState;
    playlistName: string
    constructor()
    {
/*         this.playlistName = this.track.addedAtPlaylist?.name;
        this.trackState = this.track.trackState;
        this.name = this.track.name;
        this.artists = this.track.artists;
        this.images = this.track.album.images;
        this.id = this.track.id; */
        this.playlistName = ""
        this.trackState = TrackState.NoPlaylistPlaying,
        this.name = "";
        this.artists = [];
        this.images = [];
        this.id = "";
    }
}

export enum TrackState{
    NoPlaylistPlaying,
    NotOnPlaylist,
    AlreadyOnPlaylist,
    AddedToPlaylist,
    RemovedFromPlaylist,
}