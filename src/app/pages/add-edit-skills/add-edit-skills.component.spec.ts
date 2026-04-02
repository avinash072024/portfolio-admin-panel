import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

import { AddEditSkillsComponent } from './add-edit-skills.component';

describe('AddEditSkillsComponent', () => {
  let component: AddEditSkillsComponent;
  let fixture: ComponentFixture<AddEditSkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditSkillsComponent, RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
