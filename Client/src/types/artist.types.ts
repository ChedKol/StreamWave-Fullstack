import type { Song } from "./song.types"

export type Artist = {
    id: number
    artistName: string
    coverArtistPath: string | null
    arrImage: string,
    about: string
}

export type ArtistDetails = Artist & {
    songs: Song[]; // כאן נמצא כל הקסם!
};