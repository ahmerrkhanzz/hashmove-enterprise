import { Component, OnInit } from '@angular/core';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BookingService } from '../../booking-process/booking.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {


  public helpSupport:any;
  public HelpDataLoaded: boolean;
  
  constructor(
    private _dropDownService: DropDownService,
    private bookingService: BookingService, 
    
  ) { }

  public companyData: any

  ngOnInit() {
    this.bookingService.getHelpSupport(true).subscribe((res:any) => {
      if (res.returnId > 0) {
        this.helpSupport = JSON.parse(res.returnText);
        this.HelpDataLoaded = true
        
      }
    })

  }

}
