import { TestBed } from '@angular/core/testing';

import { TwilioServiceService } from './twilio-service.service';

describe('TwilioServiceService', () => {
  let service: TwilioServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TwilioServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
