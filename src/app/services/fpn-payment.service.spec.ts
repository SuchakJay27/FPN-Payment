import { TestBed } from '@angular/core/testing';

import { FpnPaymentService } from './fpn-payment.service';

describe('FpnPaymentService', () => {
  let service: FpnPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FpnPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
