import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

import { AddEditServicesComponent } from './add-edit-services.component';

describe('AddEditServicesComponent', () => {
  let component: AddEditServicesComponent;
  let fixture: ComponentFixture<AddEditServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditServicesComponent, RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
