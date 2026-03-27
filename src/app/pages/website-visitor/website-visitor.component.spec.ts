import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteVisitorComponent } from './website-visitor.component';

describe('WebsiteVisitorComponent', () => {
  let component: WebsiteVisitorComponent;
  let fixture: ComponentFixture<WebsiteVisitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteVisitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebsiteVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
