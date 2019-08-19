import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FooterService } from './footer.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EMAIL_REGEX, getDefaultCountryCode, getImagePath, ImageSource, ImageRequiredSize } from '../../../constants/globalfunctions'
import { NguCarouselConfig, NguCarousel } from '@ngu/carousel';
import { BookingService } from "../../../components/booking-process/booking.service";
import { from } from 'rxjs';
import { FooterDetails } from '../../../interfaces/footer';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  providers: [FooterService, ToastrService],
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit, AfterViewInit {
  public carouselOne: NguCarouselConfig;
  public email: string;
  public countryCode: string;
  public associations = [];
  public socialLinks: any = [];
  public footerData: any = [
    {
      section: 'Company',
      links: [
        {
          name: 'About HashMove',
          url: ''
        },
        {
          name: 'Blog & Media',
          url: ''
        },
        {
          name: 'Careers',
          url: ''
        },
        {
          name: 'Terms',
          url: ''
        },
        {
          name: 'Contact Us',
          url: ''
        },
        {
          name: 'Legal',
          url: ''
        }
      ],
    },
    {
      section: 'Top Countries',
      links: [
        {
          name: 'UAE',
          url: ''
        },
        {
          name: 'Saudi Arabia',
          url: ''
        },
        {
          name: 'United States',
          url: ''
        },
        {
          name: 'China',
          url: ''
        },
        {
          name: 'Spain',
          url: ''
        },
        {
          name: 'Netherlands',
          url: ''
        }
      ]
    },
    {
      section: 'Import & Export',
      links: [
        {
          name: 'Import from UAE',
          url: ''
        },
        {
          name: 'Import from Saudi Arabia',
          url: ''
        },
        {
          name: 'Import from China',
          url: ''
        },
        {
          name: 'Export from UAE',
          url: ''
        },
        {
          name: 'Export from Saudi Arabia',
          url: ''
        },
        {
          name: 'Export from China',
          url: ''
        },
      ]
    },
  ];

  public footerData2: any = [
    {
      section: 'Services',
      links: [
        {
          name: 'Air Freight',
          url: ''
        },
        {
          name: 'Ocean Freight',
          url: ''
        },
        {
          name: 'Land Transport',
          url: ''
        },
        {
          name: 'Warehousing',
          url: ''
        },
      ]
    },
    {
      section: 'Resources & Tools',
      links: [
        {
          name: 'Load Calculator',
          url: ''
        },
        {
          name: 'Knowledge Base',
          url: ''
        },
        {
          name: 'Glossary',
          url: ''
        },
        {
          name: 'Help & Support Center',
          url: ''
        },
        {
          name: 'Media & Press Kit',
          url: ''
        },
        {
          name: 'Data Analytics',
          url: ''
        }
      ]
    },
    {
      section: 'Information',
      links: [
        {
          name: 'Terms & Conditions of Use',
          url: ''
        },
        {
          name: 'User Privacy Policy',
          url: ''
        },
        {
          name: 'Data Acquisition Policy',
          url: ''
        }
      ]
    }
  ];

  public doorToDoor: any = [
    {
      name: 'UAE',
      url: ''
    },
    {
      name: 'Saudi Arabia',
      url: ''
    },
    {
      name: 'United States',
      url: ''
    },
    {
      name: 'China',
      url: ''
    },
    {
      name: 'Spain',
      url: ''
    },
    {
      name: 'Netherlands',
      url: ''
    }
  ]
  public doorToDoor_2: any = [
    {
      name: 'Oman',
      url: ''
    },
    {
      name: 'Bahrain',
      url: ''
    },
    {
      name: 'Qatar',
      url: ''
    },
    {
      name: 'Kuwait',
      url: ''
    },
    {
      name: 'Egypt',
      url: ''
    },
    {
      name: 'Jordan',
      url: ''
    }
  ]

  public notifyText: string = 'Notify me'



  public footerDetails: FooterDetails;

  constructor(
    private _footer: FooterService,
    private _toast: ToastrService,
    private _http: HttpClient,
    private _bookingServices: BookingService,
  ) { }

  ngOnInit() {
    this.getUserLocation();
    this.getAssociations();
    this.getSocialLinks();
    this.getFooterLinks();
    // this.carouselOne = {
    //   grid: { size: 2, offset: 15, isFixed: false, slide: 2 },
    //   speed: 2500,
    //   point: {
    //     visible: false,
    //     hideOnSingleSlide: true
    //   },
    //   loop: true,
    //   load: 2,
    //   interval: { timing: 2500 },
    //   // vertical: { enabled: true, height: 200 },
    //   velocity: 0,
    //   animation: 'lazy',
    //   easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
    //   RTL: false
    // }


  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setAccordianTransitions()
    }, 1000);
  }

  getFooterLinks() {
    this._bookingServices.getHelpSupport(true).subscribe((res: any) => {
      this.footerDetails = JSON.parse(res.returnText)
    }, (err: any) => {
      console.log(err)
    })
  }
  
  setAccordianTransitions() {
    try {
      let acc = document.getElementsByClassName("accordion");
      let i;

      for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
          try {
            let panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
              panel.style.maxHeight = null;
            } else {
              for (let j = 0; j < acc.length; j++) {

                acc[j].classList.remove("active")
                let nextelem: any = acc[j].nextElementSibling;
                nextelem.style.maxHeight = null
              }
              panel.style.maxHeight = panel.scrollHeight + "px";
            }
            this.classList.toggle("active");
          } catch (error) { }
        });
      }
    } catch (error) { }
  }

  notify() {
    var emailRegexp: RegExp = EMAIL_REGEX
    if (this.email && !emailRegexp.test(this.email)) {
      this._toast.error('Invalid email entered.', 'Error');
      this.setNotifyText('Error')
      return false;
    }

    if (!this.email || this.email === undefined) {
      this.setNotifyText('Error')
      return false;
    }

    let params = {
      "NotifyMeEmail": this.email,
      "CountryCode": this.countryCode
    }

    this._footer.notifyMe(params).subscribe((res: any) => {
      if (res.returnId === -1) {
        this._toast.error(res.returnText, 'Error');
        this.setNotifyText('Error')
      } else {
        this._toast.success(res.returnText, 'Success');
        this.email = '';
        this.setNotifyText('Success')
      }
    }, (err: any) => {
      if (err.error) {
        this._toast.error(err.error.NotifyMeEmail[0], 'Error');
        this._toast.error(err.error.NotifyMeEmail[1], 'Error');
        this.setNotifyText('Error')
      }
    })
  }

  setNotifyText(text: string) {
    this.notifyText = text
    setTimeout(() => {
      this.notifyText = 'Notify me'
    }, 1500);
  }

  getAssociations() {
    this._footer.getAssociations().subscribe((res: any) => {
      if (res.returnId === -1) {
        this._toast.error(res.returnText, 'Error');
      } else {
        this.associations = res;
        this.associations.forEach(association => {
          association.displayImage = getImagePath(ImageSource.FROM_SERVER, association.imageName, ImageRequiredSize._48x48)
        })
      }
    }, (err: any) => {
      this._toast.error(err.returnText, 'Error');
    })
  }

  getSocialLinks() {
    this._footer.getSocialLinks().subscribe((res: any) => {
      if (res.returnId === -1) {
        this._toast.error(res.returnText, 'Error');
      } else {
        this.socialLinks = res;
        this.socialLinks.forEach(element => {
          if (element.codeValShortDesc === 'YouTube')
            element.codeValShortDesc = 'Youtube'
        });
      }
    }, (err: any) => {
      this._toast.error(err.returnText, 'Error');
    })
  }

  getUserLocation() {
    // this._http.get('https://api.teletext.io/api/v1/geo-ip').subscribe((res: any) => {
    this.countryCode = getDefaultCountryCode();
    // });
  }



}

export function emailValidator(control: FormControl): { [key: string]: any } {
  var emailRegexp: RegExp = EMAIL_REGEX
  if (control.value && !emailRegexp.test(control.value)) {
    return { invalidEmail: true };
  }
}
