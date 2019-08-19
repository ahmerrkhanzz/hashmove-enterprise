import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  transform(data: any, term: any): any {

    //check if search term is undefined
    if (!data) return null;
    if (!term) return data;

    data.map(obj => {
      obj.Date = moment(obj.regDate).format('MMM D, YYYY');
      obj.Date2 = moment(obj.regDate).format('MMM D YYYY');
      obj.Date3 = moment(obj.regDate).format('MMMM D YYYY');
      obj.Date4 = moment(obj.regDate).format('MMMM D, YYYY');
      obj.Date5 = moment(obj.regDate).format('MMMM YYYY');
      obj.Date6 = moment(obj.regDate).format('MMM YYYY');
      obj.Name = obj.firstName + " " + obj.lastName;
      obj.lastLoginCountryName = ''
    })
    return data.filter(function (item) {
      return JSON.stringify(item).toLowerCase().includes(term.replace(/\s+/g, ' ').toLowerCase());
    })

  }
}
