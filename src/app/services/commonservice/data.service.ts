import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SearchResult, HashmoveLocation } from '../../interfaces/searchResult';
import { BookingDetails } from '../../interfaces/bookingDetails';
import { CancelDialogContent } from '../../interfaces/cancel-dialog';
import { BookingRoutePorts, BookingList, UserDashboardData } from '../../interfaces/user-dashboard';
import { UserDocument } from '../../interfaces/document.interface';

@Injectable()
export class DataService {

    public searchResultFiltered: SearchResult[] = [];
    public updatedDashboardData: UserDashboardData[];

    public criteria = new BehaviorSubject<ModifyOptions>({ isMod: false, from: 'ship' });
    resetSearch = this.criteria.asObservable();

    private dataSource = new BehaviorSubject<SearchResult[]>(null);
    currentData = this.dataSource.asObservable();

    private dataProviderSource = new BehaviorSubject<SearchResult[]>(null);
    currentProvidersData = this.dataProviderSource.asObservable();

    private dataDashboardSource = new BehaviorSubject<UserDashboardData>(null);
    currentDashboardData = this.dataDashboardSource.asObservable();

    public dataBookingsSource = new BehaviorSubject(null);
    currentBokkingDataData = this.dataBookingsSource.asObservable();

    private dataTaxSource = new BehaviorSubject(null);
    currentTaxDataData = this.dataTaxSource.asObservable();

    private taxData: any

    private dataUsersSource = new BehaviorSubject(null);
    currentUsers = this.dataUsersSource.asObservable();


    private dataHashmoveLoc = new BehaviorSubject<HashmoveLocation>(null);
    dsHashmoveLocation = this.dataHashmoveLoc.asObservable();

    private warehouseBookEvent = new BehaviorSubject<WareBookFromMap>(null);
    wareBookObserver = this.warehouseBookEvent.asObservable();

    criteriafrom: string = 'search-result'

    public reloadBoard = new BehaviorSubject<boolean>(false)
    public saveButtonTrigger = new BehaviorSubject<boolean>(false)
    public reloadHeader = new BehaviorSubject<boolean>(false)
    public hideLogin = new BehaviorSubject<boolean>(false)

    public closeBookingModal = new BehaviorSubject<boolean>(false)

    public searchState = new BehaviorSubject<string>('provider')

    public searchData = new BehaviorSubject<boolean>(false);

    public bookingDetails: BookingDetails;

    public regUsers = new BehaviorSubject<number>(0);
    public totalBooking = new BehaviorSubject<number>(0);
    public loginVar = new BehaviorSubject<any>('');
    resetVal = this.loginVar.asObservable();

    public userCurrencyCode = new BehaviorSubject<any>({ code: 'AED', rate: 1 })
    public isTabCallTrue: boolean = false
    public tabCallFromDashboard: string = ''

    public cancelBookingMsg: CancelDialogContent

    public newActiveUserTab = new BehaviorSubject<string>('dashboard');

    public reloadSearchCurreny = new BehaviorSubject<boolean>(false);
    public forwardCurrencyCode = new BehaviorSubject<string>('AED');

    public reloadCurrencyConfig = new BehaviorSubject<boolean>(false)
    public currentBookingTab = new BehaviorSubject<string>('tab-current')

    public resetMapMarkers = new BehaviorSubject<boolean>(false)
    public newMapMarkerList = new BehaviorSubject<Array<BookingList>>(null)
    public appendNewMapMarkers = new BehaviorSubject<Array<BookingList>>(null)
    public updateUserDocsData = new BehaviorSubject<any>(null)
    public obsWarehouseMap = new BehaviorSubject<any>(null)

    public totalBookingAmount = new BehaviorSubject<any>(0)
    private warehouseIdMap: number = 0
    public isWarehouseDispatched: boolean = false

    private _UpdatePasswordCode: string = null

    constructor() { }

    setData(data: SearchResult[]) {
        this.dataSource.next(data);
        this.searchResultFiltered = data;
    }

    setProvidersData(data) {
        this.dataProviderSource.next(data);
        this.updatedDashboardData = data;
    }

    setDashboardData(data) {
        this.dataDashboardSource.next(data);
    }

    setBookingsData(data) {
        this.dataBookingsSource.next(data);
    }

    getBookingData() {
        return this.dataBookingsSource.getValue()
    }

    setTaxData(data) {
        this.taxData = data
    }

    getTaxData() {
        return this.taxData
    }

    modifySearch(modOptions: ModifyOptions) {
        this.criteria.next(modOptions);
    }

    login(data) {
        this.loginVar.next(data);
    }

    reloadDashboard(key: boolean) {
        this.reloadBoard.next(key)
    }

    setUsersCount(users) {
        this.dataUsersSource.next(users);
    }

    // setBookingAmount(amount: number) {
    //     this.totalBookingAmount = amount
    // }

    // getBookingAmount() {
    //     return this.totalBookingAmount
    // }


    setHashmoveLocation(data: HashmoveLocation) {
        this.dataHashmoveLoc.next(data);
    }

    getHashmoveLocation() {
        return this.dataHashmoveLoc.getValue()
    }

    dispatchWarehouseBook(data: WareBookFromMap) {
        this.warehouseBookEvent.next(data);
    }

    setmapWarehouseId($id: number) {
        this.warehouseIdMap = $id
    }
    getmapWarehouseId() {
        return this.warehouseIdMap
    }

    getDashboardData() {
        return this.dataDashboardSource.getValue();
    }

    getUpdatePassCode() {
        return this._UpdatePasswordCode
    }

    setUpdatePassCode(code) {
        this._UpdatePasswordCode = code
    }

}

export interface ModifyOptions {
    isMod?: boolean;
    from?: string;
}

export interface WareBookFromMap {
    action: boolean;
    payload: any
}
