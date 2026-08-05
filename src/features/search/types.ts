export type SearchType = "HOTEL" | "PACKAGE" | "CITY" | "COUNTRY";

export interface SearchHit {
  type: SearchType;
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  /** Built by the API — only it knows whether a route wants a slug or an id. */
  url: string;
}

export interface SearchSuggestions {
  query: string;
  hotels: SearchHit[];
  packages: SearchHit[];
  destinations: SearchHit[];
  countries: SearchHit[];
  total: number;
}

export interface PopularSearch {
  term: string;
  searchCount: number;
}
