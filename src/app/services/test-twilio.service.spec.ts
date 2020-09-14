import { TestBed } from '@angular/core/testing';

import { TestTwilioService } from './test-twilio.service';

describe('TestTwilioService', () => {
  let service: TestTwilioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestTwilioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
