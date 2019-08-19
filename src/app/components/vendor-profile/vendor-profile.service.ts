import { Injectable } from '@angular/core';
import { baseApi } from '../../constants/base.url'
import { HttpClient } from '@angular/common/http';

@Injectable()
export class VendorProfileService {

  constructor(private http: HttpClient) { }

  getProviderDetails(id) {
    let url: string = "provider/GetProviderDetail/" + id;
    return this.http.get(baseApi + url);
  }

  getProviderDetailsByID(id) {
    let url: string = "provider/GetProviderDetailByProviderID/" + id;
    return this.http.get(baseApi + url);
  }

  getProviderReviews(id) {
    let url: string = "Review/GetReviews/provider/" + id + "/0";
    return this.http.get(baseApi + url);
  }

  checkUserBooking(providerId, userId) {
    let url: string = "booking/CheckUserBookingByProvider?ProviderID=" + providerId + "&UserID=" + userId;
    return this.http.get(baseApi + url);
  }

  postReview(data) {
    let url: string = "Review/Post";
    return this.http.post(baseApi + url, data);
  }
}
