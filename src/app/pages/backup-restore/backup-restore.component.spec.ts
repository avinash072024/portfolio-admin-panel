import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { ProjectsService } from '../../services/projects/projects.service';
import { ServicesService } from '../../services/service/services.service';
import { SkillsService } from '../../services/skills/skills.service';
import { VisitorService } from '../../services/visitor/visitor.service';
import { BackupRestoreComponent } from './backup-restore.component';

describe('BackupRestoreComponent', () => {
  let component: BackupRestoreComponent;
  let educationService: jasmine.SpyObj<EducationService>;
  let experienceService: jasmine.SpyObj<ExperienceService>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let servicesService: jasmine.SpyObj<ServicesService>;
  let skillsService: jasmine.SpyObj<SkillsService>;
  let visitorService: jasmine.SpyObj<VisitorService>;
  let feedbackService: jasmine.SpyObj<FeedbackService>;
  let toastr: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    educationService = jasmine.createSpyObj<EducationService>('EducationService', ['addMultipleEducation']);
    educationService.addMultipleEducation.and.returnValue(of({ success: true }));
    experienceService = jasmine.createSpyObj<ExperienceService>('ExperienceService', ['addMultipleExperience']);
    experienceService.addMultipleExperience.and.returnValue(of({ success: true }));
    projectsService = jasmine.createSpyObj<ProjectsService>('ProjectsService', ['addMultipleProjects']);
    projectsService.addMultipleProjects.and.returnValue(of({ success: true }));
    servicesService = jasmine.createSpyObj<ServicesService>('ServicesService', ['addMultipleServices']);
    servicesService.addMultipleServices.and.returnValue(of({ success: true }));
    skillsService = jasmine.createSpyObj<SkillsService>('SkillsService', ['addMultipleSkills']);
    skillsService.addMultipleSkills.and.returnValue(of({ success: true }));
    visitorService = jasmine.createSpyObj<VisitorService>('VisitorService', ['addMultipleVisitors']);
    visitorService.addMultipleVisitors.and.returnValue(of({ success: true }));
    feedbackService = jasmine.createSpyObj<FeedbackService>('FeedbackService', ['addMultipleFeedbacks']);
    feedbackService.addMultipleFeedbacks.and.returnValue(of({ success: true }));
    toastr = jasmine.createSpyObj<ToastrService>('ToastrService', ['error', 'success', 'warning']);

    TestBed.configureTestingModule({
      imports: [BackupRestoreComponent],
      providers: [
        { provide: EducationService, useValue: educationService },
        { provide: ExperienceService, useValue: experienceService },
        { provide: ProjectsService, useValue: projectsService },
        { provide: ServicesService, useValue: servicesService },
        { provide: SkillsService, useValue: skillsService },
        { provide: VisitorService, useValue: visitorService },
        { provide: FeedbackService, useValue: feedbackService },
        { provide: NgxSpinnerService, useValue: jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']) },
        { provide: ToastrService, useValue: toastr }
      ]
    });

    const fixture = TestBed.createComponent(BackupRestoreComponent);
    component = fixture.componentInstance;
  });

  it('imports records for the selected backup type without database-generated fields', async () => {
    component.selectedBackup = 'education';
    component.selectedFile = new File([
      JSON.stringify([
        { _id: 'existing-id', id: 'existing-virtual-id', __v: 0, title: 'Degree' },
        { _id: 'another-id', __v: 1, title: 'Diploma' }
      ])
    ], 'education-backup.json', { type: 'application/json' });

    await component.importBackup();

    expect(educationService.addMultipleEducation).toHaveBeenCalledTimes(1);
    expect(educationService.addMultipleEducation).toHaveBeenCalledWith([
      { title: 'Degree' },
      { title: 'Diploma' }
    ]);
    expect(component.importedCount).toBe(2);
    expect(toastr.success).toHaveBeenCalled();
  });

  it('rejects invalid JSON without sending records to the API', async () => {
    component.selectedBackup = 'education';
    component.selectedFile = new File(['{invalid'], 'education-backup.json', { type: 'application/json' });

    await component.importBackup();

    expect(educationService.addMultipleEducation).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith('The selected file is not valid JSON.');
  });

  it('uses the visitor bulk API for visitor backups', async () => {
    component.selectedBackup = 'visitors';
    component.selectedFile = new File([JSON.stringify([{ path: '/home' }])], 'visitors-backup.json', { type: 'application/json' });

    await component.importBackup();

    expect(visitorService.addMultipleVisitors).toHaveBeenCalledOnceWith([{ path: '/home' }]);
  });

  it('uses the feedback bulk API for feedback backups', async () => {
    component.selectedBackup = 'feedback';
    component.selectedFile = new File([JSON.stringify([{ message: 'Great' }])], 'feedback-backup.json', { type: 'application/json' });

    await component.importBackup();

    expect(feedbackService.addMultipleFeedbacks).toHaveBeenCalledOnceWith([{ message: 'Great' }]);
  });
});
