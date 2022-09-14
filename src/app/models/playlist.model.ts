import { Image } from "./image.model";
import { Track } from "./track.model";

export interface Playlist
{
    collaborative: boolean,
    href: string,
    id: string,
    images: Image[]
    name: string,
    public: boolean,
    tracks: {
      href: string,
      items: Track[]
      limit: number,
      next: string,
      offset: number,
      previous: string,
      total: number
    },
    type: string,
    uri: string
  }