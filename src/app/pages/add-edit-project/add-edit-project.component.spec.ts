import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

import { AddEditProjectComponent } from './add-edit-project.component';

describe('AddEditProjectComponent', () => {
  let component: AddEditProjectComponent;
  let fixture: ComponentFixture<AddEditProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditProjectComponent, RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
