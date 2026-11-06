import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';

import { AddEditAboutComponent } from './add-edit-about.component';

describe('AddEditAboutComponent', () => {
  let component: AddEditAboutComponent;
  let fixture: ComponentFixture<AddEditAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditAboutComponent, HttpClientTestingModule, RouterTestingModule, ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
