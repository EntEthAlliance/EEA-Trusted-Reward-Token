import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
})
export class ShortNumberPipe implements PipeTransform {
  transform(input, args?) {
    const suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];
    if (Number.isNaN(input)) {
      return 0;
    }
    if (input < 10001) {
      return input;
    }
    const exp = Math.floor(Math.log(input) / Math.log(1000));
    return (input / Math.pow(1000, exp)).toFixed(args) + suffixes[exp - 1];
  }
}
