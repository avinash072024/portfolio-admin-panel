import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { ResumeService } from '../../services/resume/resume.service';

import { GenerateCoverLetterComponent } from './generate-cover-letter.component';

describe('GenerateCoverLetterComponent', () => {
  let component: GenerateCoverLetterComponent;
  let fixture: ComponentFixture<GenerateCoverLetterComponent>;
  let resumeService: jasmine.SpyObj<ResumeService>;

  beforeEach(async () => {
    resumeService = jasmine.createSpyObj<ResumeService>('ResumeService', ['generateCoverLetter']);

    await TestBed.configureTestingModule({
      imports: [GenerateCoverLetterComponent],
      providers: [
        { provide: ResumeService, useValue: resumeService },
        { provide: ToastrService, useValue: jasmine.createSpyObj<ToastrService>('ToastrService', ['success', 'error']) },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateCoverLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call the API when required fields are empty', () => {
    component.generateCoverLetter();

    expect(component.coverLetterForm.touched).toBeTrue();
    expect(resumeService.generateCoverLetter).not.toHaveBeenCalled();
  });
});
