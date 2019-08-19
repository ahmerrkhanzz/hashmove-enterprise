import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { UserService } from "./../user-service";
import { PaginationInstance } from "ngx-pagination";
import { baseExternalAssets } from '../../../constants/base.url';
import { Tea, compareValues, HashStorage, loading } from '../../../constants/globalfunctions';
import { DataService } from '../../../services/commonservice/data.service';
import { ToastrService } from '../../../../../node_modules/ngx-toastr';
import { NgbModal } from '../../../../../node_modules/@ng-bootstrap/ng-bootstrap';
import { RegDialogComponent } from "../../../shared/dialogues/reg-dialog/reg-dialog.component";
import { ConfirmDeleteAccountComponent } from "../../../shared/dialogues/confirm-delete-account/confirm-delete-account.component";
import { firstBy } from 'thenby';

@Component({
  selector: "app-allusers",
  templateUrl: "./allusers.component.html",
  styleUrls: ["./allusers.component.scss"]
})
export class AllusersComponent implements OnInit {
  public userObj: any = {};
  public dashboardData: any = {};
  public response: any;
  public userInfo: any;
  public users: any;
  public searchUser: any;
  public hasDeleteRights: boolean = true;
  public totalUsers: number = 0;
  public adminUsers = [];
  public nonAdminUsers = [];
  public showCompanyInfo: boolean = true;

  //Pagination work
  public maxSize: number = 7;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public userPaginationConfig: PaginationInstance = {
    id: "users",
    itemsPerPage: 10,
    currentPage: 1
  };

  public labels: any = {
    previousLabel: "",
    nextLabel: ""
  };
  public currentSort: string = "name";

  constructor(
    private _userService: UserService,
    private _dataService: DataService,
    private _toast: ToastrService,
    private _modalService: NgbModal
  ) { }

  ngOnInit() {
    this.userObj = JSON.parse(Tea.getItem("loginUser"));

    if (
      !this.userObj.IsAdmin &&
      this.userObj.IsCorporateUser &&
      this.userObj.IsVerified
    ) {
      this.hasDeleteRights = false;
    } else {
      this.hasDeleteRights = true;
    }
    this.getAllUsers(this.userObj.UserID);
    this._dataService.currentDashboardData.subscribe(data => {
      if (data !== null) {
        this.dashboardData = data;
      }
    });
  }

  public superAdmin: any;

  getAllUsers(userId) {
    this._userService.getAllUsers(userId).subscribe(res => {
      this.response = res;
      this.userInfo = this.response.returnObject;
      this._dataService.setUsersCount(this.userInfo);
      this.totalUsers = this.userInfo.length;
      this.userInfo.forEach(element => {
        if (element.userImage) {
          element.userImage = baseExternalAssets + element.userImage;
        }
      });
      this.nonAdminUsers = this.userInfo.filter(e => !e.isAdmin);
      this.adminUsers = this.userInfo.filter(e => e.isAdmin);
      this.userInfo = this.userInfo.sort(
        compareValues("firstName", "asc")
      );
      this.nonAdminUsers = this.nonAdminUsers.sort(
        compareValues("firstName", "asc")
      );
      this.superAdmin = this.adminUsers.sort(compareValues("regDate", "asc"));
      if (this.userObj.UserID === this.superAdmin[0].userID)
        this.showCompanyInfo = false;

    });
  }

  openRegister() {
    this._dataService.hideLogin.next(true);
    const modalRef = this._modalService.open(RegDialogComponent, {
      size: "lg",
      backdrop: "static",
      keyboard: false
    });

    let obj = {
      UserID: this.userObj.UserID,
      CompanyName: this.dashboardData.CompanyName,
      CompanyID: this.dashboardData.CompanyID
    };

    modalRef.componentInstance.shareUserObject = obj;
    modalRef.result.then(result => {
      if (result === "success") {
        this.getAllUsers(obj.UserID);
      }
    });
    setTimeout(() => {
      if (
        document
          .getElementsByTagName("body")[0]
          .classList.contains("modal-open")
      ) {
        document.getElementsByTagName("html")[0].style.overflowY = "hidden";
      }
    }, 0);
  }

  deleteUser(user) {
    const modalRef = this._modalService.open(ConfirmDeleteAccountComponent, {
      size: "lg",
      centered: true,
      windowClass: "small-modal",
      backdrop: "static",
      keyboard: false
    });
    let obj = {
      deletingUserID: user.UserID,
      deleteByUserID: this.userObj.UserID,
      type: "user"
    };
    modalRef.componentInstance.account = obj;

    setTimeout(() => {
      if (
        document
          .getElementsByTagName("body")[0]
          .classList.contains("modal-open")
      ) {
        document.getElementsByTagName("html")[0].style.overflowY = "hidden";
      }
    }, 0);
  }

  onPageChange(number: any) {
    this.userPaginationConfig.currentPage = number;
  }

  public resp: any;

  makeAdmin(adminID, userID) {
    if (this.adminUsers.length === 5) {
      this._toast.warning('You have to remove an admin in case to add more', 'Warning')
      return;
    }
    loading(true);
    this._userService.makeAdmin(adminID, userID).subscribe(
      (res: Response) => {
        this.resp = res;
        this.userInfo = this.resp.returnObject;
        this._dataService.setUsersCount(this.userInfo);
        this.totalUsers = this.userInfo.length;
        this.userInfo.forEach(element => {
          if (element.userImage) {
            element.userImage = baseExternalAssets + element.userImage;
          }
        });
        this.nonAdminUsers = this.userInfo.filter(e => !e.isAdmin);
        this.adminUsers = this.userInfo.filter(e => e.isAdmin);
        this.nonAdminUsers = this.nonAdminUsers.sort(
          compareValues("firstName", "asc")
        );
        loading(false);
        this._toast.success(this.resp.returnText, this.resp.returnStatus);
      },
      (err: any) => {
      }
    );
  }

  public removeResp: any;
  removeAdmin(adminID, userID) {
    loading(true);
    this._userService.removeAdmin(adminID, userID).subscribe(
      (res: Response) => {
        this.removeResp = res;
        this.userInfo = this.removeResp.returnObject;
        this._dataService.setUsersCount(this.userInfo);
        this.totalUsers = this.userInfo.length;
        this.userInfo.forEach(element => {
          if (element.userImage) {
            element.userImage = baseExternalAssets + element.userImage;
          }
        });
        this.nonAdminUsers = this.userInfo.filter(e => !e.isAdmin);
        this.adminUsers = this.userInfo.filter(e => e.isAdmin);
        this.nonAdminUsers = this.nonAdminUsers.sort(
          compareValues("firstName", "asc")
        );
        loading(false);
        this._toast.success(
          this.removeResp.returnText,
          this.removeResp.returnStatus
        );
      },
      (err: any) => {
      }
    );
  }

  sortUsers(type, value) {
    this.currentSort = value;
    const { userInfo } = this
    let newFilt = userInfo.sort(firstBy(type));
    this.userInfo = newFilt
  }
}
