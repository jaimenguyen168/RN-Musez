export interface Museum {
  businessStatus: string;
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
  icon: string;
  iconBackgroundColor: string;
  iconMaskBaseUri: string;
  name: string;
  openingHours: {
    openNow: boolean;
  };
  photos: {
    height: number;
    htmlAttributions: string[];
    photoReference: string;
    width: number;
  }[];
  placeId: string;
  plusCode: {
    compoundCode: string;
    globalCode: string;
  };
  rating: number;
  reference: string;
  scope: string;
  types: string[];
  userRatingsTotal: number;
  vicinity: string;
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
