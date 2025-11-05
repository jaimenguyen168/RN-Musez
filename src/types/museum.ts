export interface Museum {
  placeId: string;
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  vicinity?: string;
  formattedAddress?: string;
  photos?: {
    photoReference: string;
    height: number;
    width: number;
  }[];
  openingHours?: {
    openNow: boolean;
  };
  currentOpeningHours?: {
    openNow: boolean;
  };
  businessStatus?: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface MuseumDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  website?: string;
  url?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  openingHours?: {
    openNow: boolean;
    periods?: {
      close?: {
        day: number;
        time: string;
      };
      open: {
        day: number;
        time: string;
      };
    }[];
    weekdayText?: string[];
  };
  currentOpeningHours?: {
    openNow: boolean;
    periods?: {
      close?: {
        day: number;
        time: string;
      };
      open: {
        day: number;
        time: string;
      };
    }[];
    weekdayText?: string[];
  };
  secondaryOpeningHours?: {
    openNow: boolean;
    periods?: {
      close?: {
        day: number;
        time: string;
      };
      open: {
        day: number;
        time: string;
      };
    }[];
    weekdayText?: string[];
  }[];
  photos?: {
    height: number;
    width: number;
    photoReference: string;
    htmlAttributions: string[];
  }[];
  reviews?: {
    authorName: string;
    authorUrl?: string;
    language: string;
    profilePhotoUrl?: string;
    rating: number;
    relativeTimeDescription: string;
    text: string;
    time: number;
  }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  types: string[];
  businessStatus: string;
  editorialSummary?: {
    language: string;
    overview: string;
  };
}
