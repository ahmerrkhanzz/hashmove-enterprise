import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { routing } from './public.route';
import { PublicComponent } from './public.component'
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ViewBookingComponent } from '../components/user/view-booking-detail/view-booking.component';
// import { HashmoveMap } from '../shared/map-utils/map.component';
import { NguCarouselModule } from '@ngu/carousel';
import { NgScrollbarModule } from 'ngx-scrollbar';
// import { DragDropComponent } from '../shared/dialogues/drag-drop/drag-drop.component';
// import { ViewBookingCardComponent } from '../shared/cards/view-booking-card/view-booking-card.component';
// import { DndDirective } from '../services/dnd.directive';
// import { FileDropModule } from 'angular2-file-drop';
import { SharedModule } from '../shared/shared.module';
import { UserService } from '../components/user/user-service';
import { DataService } from '../services/commonservice/data.service';
import { BookingService } from '../components/booking-process/booking.service';
import { DropDownService } from '../services/dropdownservice/dropdown.service';



@NgModule({
  imports: [
    CommonModule,
    NgbModule.forRoot(),
    routing,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NguCarouselModule,
    NgScrollbarModule,
    //FileDropModule
  ],
  declarations: [
    PublicComponent,
    ViewBookingComponent,
    // HashmoveMap,
    // DragDropComponent,
    // ViewBookingCardComponent,
    // DndDirective
  ],
  entryComponents: [
    
  ],
  exports:[
    // DndDirective,
    // DragDropComponent,
  ],
  providers: [
    DataService,
    BookingService,
    DropDownService,
    UserService,
  ]
})

export class PublicModule { }
