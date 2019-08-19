import { TestBed, inject } from '@angular/core/testing';

import { DropDownService } from './dropdown.service';

describe('CountryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DropDownService]
    });
  });

  it('should be created', inject([DropDownService], (service: DropDownService) => {
    expect(service).toBeTruthy();
  }));
});
