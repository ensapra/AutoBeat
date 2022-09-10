import { Album } from "./albun.mode";
import { Artist } from "./artist.model";
import { Image } from "./image.model";

export interface Track {
    album: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    external_urls:{images:Image[]}
    popularity: number;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
}