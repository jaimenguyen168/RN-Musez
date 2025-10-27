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
