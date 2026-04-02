import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { VisitorService } from './visitor.service';

describe('VisitorService', () => {
  let service: VisitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(VisitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
