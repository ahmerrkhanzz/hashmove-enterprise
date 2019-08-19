import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataService } from './commonservice/data.service';
import { SearchCriteria } from '../interfaces/searchCriteria';
import { HashStorage, Tea } from '../constants/globalfunctions';
import { BookingDetails } from '../interfaces/bookingDetails';
import { Observable } from 'rxjs/Observable';
import { LoginUser } from '../interfaces/user.interface';


@Injectable()
export class RoutesGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _dataService: DataService
  ) { }

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    try {

      const searchCriteria: SearchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
      const bookingData: BookingDetails = this._dataService.getBookingData()
      const currentUrl: string = state.url

      let criteriaFrom: string = null
      criteriaFrom = (searchCriteria) ? searchCriteria.criteriaFrom : null


      if (currentUrl === '/home') {
        return true;
      }

      if (currentUrl === '/user/bookings' && bookingData) {
        return true;
      }

      //SEA-FCL Start
      if (currentUrl === '/fcl-search/shipping-lines' && searchCriteria && searchCriteria.searchMode === 'sea-fcl' && criteriaFrom && criteriaFrom === 'search') {
        return true;
      }

      if (currentUrl === '/fcl-search/forwarders' && searchCriteria.searchMode === 'sea-fcl' && criteriaFrom && criteriaFrom === 'search') {
        return true;
      }

      if (currentUrl === '/fcl-search/forwarders' && searchCriteria) {
        this.navigateAction('fcl-search/shipping-lines');
        return false;
      }
      //SEA-FCL End


      //SEA-LCL Start
      if (currentUrl === '/lcl-search/consolidators' && searchCriteria && searchCriteria.searchMode === 'sea-lcl' && criteriaFrom && criteriaFrom === 'search') {
        return true;
      }
      //SEA-LCL End
      //SEA-LCL Start

      if (currentUrl === '/truck-search/consolidators' && searchCriteria && searchCriteria.searchMode === 'truck-ftl' && criteriaFrom && criteriaFrom === 'search') {
        return true;
      }
      //SEA-LCL End

      //AIR-LCL Start

      if (currentUrl === '/air/air-lines' && searchCriteria && searchCriteria.searchMode === 'air-lcl' && criteriaFrom && criteriaFrom === 'search') {
        return true;
      }

      if (currentUrl === '/air/freight-forwarders' && searchCriteria.searchMode === 'air-lcl' && criteriaFrom && criteriaFrom === 'search') {
        return true;
      }

      if (currentUrl === '/air/freight-forwarders' && searchCriteria) {
        this.navigateAction('air/air-lines');
        return false;
      }
      //AIR-LCL End

      //WAREHOUSE-LCL Start
      if (currentUrl === '/warehousing/warehousing-search' && searchCriteria && searchCriteria.searchMode === 'warehouse-lcl' && criteriaFrom && criteriaFrom === 'search') {
        return true;
      }
      //WAREHOUSE-LCL End

      //Booking Process Start
      if (currentUrl === '/booking-process' && searchCriteria && bookingData) {
        return true;
      }

      if (currentUrl === '/booking-process' && searchCriteria && criteriaFrom && criteriaFrom === 'search' && !bookingData) {

        if (searchCriteria.searchMode === 'sea-fcl') {
          this.navigateAction('/fcl-search/shipping-lines');
          return false;
        }
        if (searchCriteria.searchMode === 'sea-lcl') {
          this.navigateAction('/lcl-search/consolidators');
          return false;
        }
        if (searchCriteria.searchMode === 'truck-ftl') {
          this.navigateAction('/truck-search/consolidators');
          return false;
        }
        if (searchCriteria.searchMode === 'air-lcl') {
          this.navigateAction('/air/air-lines');
          return false;
        }
        if (searchCriteria.searchMode === 'warehouse-lcl') {
          this.navigateAction('/warehousing/warehousing-search');
          return false;
        }
      }
      //Booking Process End

      if (currentUrl === '/thankyou-booking' && bookingData) {
        return true;
      }

      if (currentUrl === '/thankyou-booking' && !bookingData) {
        this.navigateAction('/home');
        return false;
      }

      const userLogin: LoginUser = JSON.parse(Tea.getItem('loginUser'))
      const { IsLogedOut } = userLogin

      if (currentUrl === '/user/bookings' || currentUrl === '/user/dashboard' && !IsLogedOut) {
        this.navigateAction('/home');
        return true;
      }

      if (currentUrl === '/user/bookings' || currentUrl === '/user/dashboard' && !IsLogedOut) {
        return true;
      } else {
        this.navigateAction('/home');
        return false;
      }

    } catch (error) {
      this.navigateAction('/home');
      return false;
    }
  }

  navigateAction($url: string) {
    this._router.navigate([$url])
  }
}
