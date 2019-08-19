import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MainService } from '../../../components/main/main.service'

@Component({
  selector: 'app-search-footer',
  templateUrl: './search-footer.component.html',
  styleUrls: ['./search-footer.component.scss'],
  providers: [MainService],
  encapsulation: ViewEncapsulation.None
})
export class SearchFooterComponent implements OnInit {

  public count: number;
  constructor(private _mainService: MainService) { }

  ngOnInit() {
    this.getprovidersCount();
  }

  getprovidersCount() {
    this._mainService.getProvidersCount().subscribe((res: any) => {
      this.count = res;
    }, (err: any) => {
    })
  }
}
