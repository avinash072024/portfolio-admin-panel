import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

import { DataBackupComponent } from './data-backup.component';

describe('DataBackupComponent', () => {
  let component: DataBackupComponent;
  let fixture: ComponentFixture<DataBackupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataBackupComponent, HttpClientTestingModule, ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
