import { TestBed } from '@angular/core/testing';

import { ConfiguratorService } from './configurator.service';

describe('ConfiguratorService', () => {
  let service: ConfiguratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
