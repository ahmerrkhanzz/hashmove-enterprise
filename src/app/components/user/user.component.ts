import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  Output,
  EventEmitter
} from "@angular/core";
import { Router } from "@angular/router";
import { HashStorage, Tea, loading } from "../../constants/globalfunctions";
import { BookingList } from "../../interfaces/user-dashboard";
import { DataService } from "../../services/commonservice/data.service";
import { UserService } from "./user-service";
import { encode } from "punycode";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"]
})
export class UserComponent implements OnInit {
  public isVerified: boolean = false;
  public isAdmin: boolean;
  bookingList: any;
  resp: any;
  public loading: boolean = false;
  public dashboardData: any = [];

  constructor(
    private renderer: Renderer2,
    private _router: Router,
    private _dataService: DataService,
    private _http: UserService
  ) { }

  ngOnInit() {
    if (!HashStorage) {
      this._router.navigate(["enable-cookies"]);
      return;
    }
    HashStorage.removeItem('tempSearchCriteria');
    let userItem = JSON.parse(Tea.getItem("loginUser"));
    this.isVerified = userItem.IsVerified;
    this.isAdmin = userItem.IsAdmin;
    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');
    this.getDashboardData(userItem.UserID)
  }




  getDashboardData(userID) {
    loading(true);
    this._http.getDashBoardData(userID).subscribe(res => {
      loading(false);
      this.resp = res;
      this.dashboardData = JSON.parse(this.resp.returnText);
      if (this.dashboardData && this.dashboardData.BookingDetails && this.dashboardData.BookingDetails.length) {
        this.dashboardData.BookingDetails;
      }
      this._dataService.setDashboardData(this.dashboardData);
    });
  }

  ngOnDestroy() {
    this.dashboardData = null;
    this._dataService.setDashboardData(this.dashboardData);
  }
}
