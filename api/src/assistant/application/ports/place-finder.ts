export type PlaceMatch = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

/** Port: turn a place name or a map link into coordinates. */
export interface PlaceFinder {
  find(query: string): Promise<PlaceMatch[]>;
}
