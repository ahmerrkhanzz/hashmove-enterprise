import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Tea, HashStorage } from '../../../constants/globalfunctions';

import { Router } from '@angular/router';
import { DataService } from '../../../services/commonservice/data.service';
import { BookingList } from '../../../interfaces/user-dashboard';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  public bookingList: any[];
  @Input() bookings: any;
  @Input() users: number;
  @Input() IsVerified: boolean;
  @Input() IsAdmin: boolean;
  @Output() activeItem = new EventEmitter<string>();

  public selectedItem: string;
  public dashboardData: any = [];
  public currentBookingsCount: number;
  public userItem;
  public nonAdminUser: boolean = false;

  constructor(
    private _router: Router,
    private _dataService: DataService
  ) { }

  ngOnInit() {
    let userData = JSON.parse(Tea.getItem('loginUser'));
    if (userData.IsCorporateUser && userData.IsVerified) {
      this.nonAdminUser = true;
    }
    this.currentBookingsCount = 0
    this._dataService.currentDashboardData.subscribe((data: any) => {
      if (data !== null) {
        this.dashboardData = data;
        if (data.CurrentBookingCount) {
          this.currentBookingsCount = data.CurrentBookingCount
        } else {
          this.currentBookingsCount = 0
        }
      }
    });

    this._dataService.currentUsers.subscribe(data => {
      if (data !== null) {
        if (this.dashboardData.CompanyUserCount < data.length) {
          this.dashboardData.CompanyUserCount = data.length;
        }
      }
    });
  }

  listClicked(event, newValue) {
    this.selectedItem = newValue
    this.activeItem.emit(newValue)
  }
  getClass(path, path2?: string) {
    return (location.pathname === path || (path2 && location.pathname.includes(path2))) ? 'active' : '';
  };
  tonavigate(url) {
    this._router.navigate([url]);
  }

}

