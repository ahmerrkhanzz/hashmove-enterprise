import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { DropDownService } from "../../services/dropdownservice/dropdown.service";

@Injectable()
export class BaseComponentUtils {

  constructor(
    private _dropDownService: DropDownService
  ) { }

  isCitySearching: boolean = false
  hasCitySearchFailed: boolean = false
  hasCitySearchSuccess: boolean = false

  search2 = (text$: Observable<string>) =>
    text$
      .debounceTime(300) //debounce time
      .distinctUntilChanged()
      .do(() => {
        this.isCitySearching = true;
        this.hasCitySearchFailed = false;
        this.hasCitySearchSuccess = false;
      }) // do any action while the user is typing
      .switchMap(term => {
        let some: any = []; //  Initialize the object to return
        if (term && term.length >= 3) { //search only if item are more than three
          some = this._dropDownService.getFilteredCity(term)
            .do((res) => {
              this.isCitySearching = false;
              this.hasCitySearchSuccess = true;
              return res
            })
            .catch(() => {
              this.isCitySearching = false;
              this.hasCitySearchFailed = true;
              return []
            })
        } else {
          some = [];
        }
        return some
      })
      .do((res) => {
        this.isCitySearching = false;
        return res
      }); // final server list
}
