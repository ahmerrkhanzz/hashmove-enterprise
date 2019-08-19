import { Injectable } from "@angular/core";
import { baseApi } from "../../constants/base.url";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class UserService {
  headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders();
  }

  getDashBoardData(userId) {
    let url = "general/GetUserDashboardLoginDetail/" + userId;
    return this.http.get(baseApi + url);
  }

  getAllUsers(userId) {
    let url = "users/GetUserListByAdmin?userID=" + userId;
    return this.http.get(baseApi + url);
  }

  resendEmail(userId) {
    let url = "users/ResendEmail/" + userId;
    return this.http.get(baseApi + url);
  }

  getBookingDetails(bookingId) {
    let url = "booking/GetBookingSummary/" + bookingId;
    return this.http.get(baseApi + url);
  }
  updateSupInfo(data) {
    let url = `booking/UpdateBookingContactInfo/${data.BookingNature}/${data.BookingID}/${data.LoginUserID}/${data.PortNature}/${data.ContactInfoFor}`
    return this.http.put(baseApi + url, data.BookingSupDistInfo);
  }
  discardBooking(params) {
    let url = "booking/Delete/" + params.loginUserID + "/" + params.BookingID;
    return this.http.delete(baseApi + url);
  }

  continueBooking(bookingId) {
    let url = "booking/GetBookingSummary/" + bookingId;
    return this.http.get(baseApi + url);
  }

  // User Settings Start

  getUserProfile(userId) {
    let url = "users/GetUserProfile/" + userId;
    return this.http.get(baseApi + url);
  }
  profileUpdate(data) {
    let url = "users/UpdatePersonalInfo";
    return this.http.put(baseApi + url, data);
  }

  regionalUpdate(data) {
    let url = "users/UpdateRegionalSettings";
    return this.http.put(baseApi + url, data);
  }
  companyUpdate(data) {
    let url = "users/UpdateCompanyInfo";
    return this.http.put(baseApi + url, data);
  }
  updateShipping(data) {
    let url = "users/UpdateShippingInfo";
    return this.http.put(baseApi + url, data);
  }
  updatePassword(data) {
    let url = "users/ChangePassword";
    return this.http.put(baseApi + url, data);
  }

  getNotificationSettings(userId) {
    let url = "users/GetUserNotificationSetting/" + userId;
    return this.http.get(baseApi + url);
  }

  setNotificationSettings(data, userId) {
    let url = "users/UpdateUserNotification/" + userId;
    return this.http.put(baseApi + url, data);
  }

  getServiceType() {
    let url = "servicetype/GetAll";
    return this.http.get(baseApi + url);
  }

  getUserDocument(userId) {
    let url = `Document/GetUserDocument/${userId}`;
    return this.http.get(baseApi + url);
  }
  getDocumentbyProcessUser(userId) {

    let url = `Document/GetDocumentbyProcessUser/user/${userId}`;
    return this.http.get(baseApi + url);
  }

  saveUserDocument(data) {
    let url = "Document/Post";
    return this.http.post(baseApi + url, data);
  }

  makeAdmin(adminID, userID) {
    let url =
      "users/UpdateUserAsAdmin?updatedByUserID=" +
      adminID +
      "&userID=" +
      userID;
    return this.http.put(baseApi + url, {});
  }

  removeAdmin(adminID, userID) {
    let url =
      "users/UpdateUserAsNonAdmin?updatedByUserID=" +
      adminID +
      "&userID=" +
      userID;
    return this.http.put(baseApi + url, {});
  }

  getUserGraphData(userId: number, tag: string) {
    const url = `general/GetGraphicalDashboard/${userId}/${tag}`
    return this.http.get(baseApi + url)
  }

  getBookingReasons() {
    const url = `booking/GetBookingReason`
    return this.http.get(baseApi + url)
  }

  getBookingStatuses($bookingType: string) {
    let url = `Status/GetBookingStatus/${$bookingType}`;
    return this.http.get(baseApi + url);
  }

  cancelBooking(data) {
    const url = `booking/CancelBooking`
    return this.http.put(baseApi + url, data)
  }

  getContainerDetails(bookingKey, portalName) {
    const url = `booking/GetBookingContainer/${bookingKey}/${portalName}`;
    return this.http.get(baseApi + url);
  }

  /**
   *
   * GET USER KEY FOR BOOKING SHARE
   * @param {number} userId
   * @returns
   * @memberof UserService
   */
  getGuestUserKey(userId) {
    const url = `general/GetGuestUserKey/${userId}`;
    return this.http.get(baseApi + url);
  }
}
