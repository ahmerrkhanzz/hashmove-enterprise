import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'floatNumbers'
})
export class FloatNumbersPipe implements PipeTransform {
    transform(value: string): string {
        const isFloat = (n) => {
            return n === +n && n !== (n | 0);
        }

        return isFloat(+value) ? (+value).toFixed(2) : value;
    }
}