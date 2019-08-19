import { Component, OnInit, Renderer2 } from '@angular/core';
import { FooterService } from '../../shared/utils/footer/footer.service';
import { ToastrService } from 'ngx-toastr';
import { HashStorage } from '../../constants/globalfunctions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enable-cookies',
  templateUrl: './enable-cookies.component.html',
  styleUrls: ['./enable-cookies.component.scss']
})
export class EnableCookiesComponent implements OnInit {

  public socialLinks: any = [];


  constructor(
    private renderer: Renderer2,
    private _footer: FooterService,
    private _toast: ToastrService,
    private _router: Router
  ) { }


  ngOnInit() {


    if (HashStorage) {
      this._router.navigate(['home']);
      return
    }

    this.renderer.addClass(document.body, 'bg-grey');
    try {
      this.renderer.removeClass(document.body, 'bg-white');
      this.renderer.removeClass(document.body, 'bg-lock-grey');
    } catch {

    }
    this.getSocialLinks()
  }

  getSocialLinks() {
    this._footer.getSocialLinks().subscribe((res: any) => {
      if (res.returnId === -1) {
        this._toast.error(res.returnText, 'Error');
      } else {
        this.socialLinks = res;
        this.socialLinks.forEach(element => {
          if (element.codeValShortDesc === 'YouTube')
            element.codeValShortDesc = 'play'
        });
      }
    }, (err: any) => {
      this._toast.error(err.returnText, 'Error');
    })
  }

}
