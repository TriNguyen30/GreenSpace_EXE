export interface Rating {
  ratingId: string;
  productId: string;
  productName: string;
  userName: string;
  stars: number;
  comment: string;
  createdDate: string;
}

export interface RatingUpdatePayload {
  stars: number;
  comment: string;
}

export interface RatingCreatePayload {
  productId: string;
  stars: number;
  comment: string;
}

