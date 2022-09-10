import { Track } from "./track.model";

export interface PlayingState {
    timestamp: number;
    progress_ms: number;
    item: Track;
    currently_playing_type: string;
    is_playing: boolean;
}