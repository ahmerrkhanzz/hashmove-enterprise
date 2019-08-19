import { Component, OnInit, Input } from '@angular/core';
import { getProviderImage, ImageSource, ImageRequiredSize, getImagePath } from '../../../constants/globalfunctions';

@Component({
  selector: 'app-vendor-services',
  templateUrl: './vendor-services.component.html',
  styleUrls: ['./vendor-services.component.scss']
})
export class VendorServicesComponent implements OnInit {
  @Input() services:any;
  constructor() { }

  ngOnInit() {
  }

  getUIImage($image: string) {
    return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
  }

}
