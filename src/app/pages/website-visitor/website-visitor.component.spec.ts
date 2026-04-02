import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

import { WebsiteVisitorComponent } from './website-visitor.component';

describe('WebsiteVisitorComponent', () => {
  let component: WebsiteVisitorComponent;
  let fixture: ComponentFixture<WebsiteVisitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteVisitorComponent, RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot()]
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
