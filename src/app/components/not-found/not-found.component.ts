import { Component, OnInit, Renderer2 } from '@angular/core';
import { FooterService } from '../../shared/utils/footer/footer.service';
import { ToastrService } from 'ngx-toastr';
import { HashStorage, loading } from '../../constants/globalfunctions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  public socialLinks: any = [];


  constructor(
    private renderer: Renderer2,
    private _footer: FooterService,
    private _toast: ToastrService,
    private _router: Router
  ) { }


  ngOnInit() {
    loading(false)
    try {
      // this.renderer.addClass(document.body, 'bg-grey');
      // this.renderer.removeClass(document.body, 'bg-white');
      // this.renderer.removeClass(document.body, 'bg-lock-grey');
    } catch {

    }
  }
 
}
