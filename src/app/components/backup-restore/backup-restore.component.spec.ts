import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { ProjectsService } from '../../services/projects/projects.service';
import { ServicesService } from '../../services/service/services.service';
import { SkillsService } from '../../services/skills/skills.service';
import { BackupRestoreComponent } from './backup-restore.component';

describe('BackupRestoreComponent', () => {
  let component: BackupRestoreComponent;
  let educationService: jasmine.SpyObj<EducationService>;
  let toastr: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    educationService = jasmine.createSpyObj<EducationService>('EducationService', ['addEducation']);
    educationService.addEducation.and.returnValue(of({ success: true }));
    toastr = jasmine.createSpyObj<ToastrService>('ToastrService', ['error', 'success', 'warning']);

    TestBed.configureTestingModule({
      imports: [BackupRestoreComponent],
      providers: [
        { provide: EducationService, useValue: educationService },
        { provide: ExperienceService, useValue: jasmine.createSpyObj('ExperienceService', ['addExperience']) },
        { provide: ProjectsService, useValue: jasmine.createSpyObj('ProjectsService', ['addProject']) },
        { provide: ServicesService, useValue: jasmine.createSpyObj('ServicesService', ['addService']) },
        { provide: SkillsService, useValue: jasmine.createSpyObj('SkillsService', ['addSkill']) },
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

    expect(educationService.addEducation).toHaveBeenCalledTimes(2);
    expect(educationService.addEducation).toHaveBeenCalledWith({ title: 'Degree' });
    expect(component.importedCount).toBe(2);
    expect(toastr.success).toHaveBeenCalled();
  });

  it('rejects invalid JSON without sending records to the API', async () => {
    component.selectedBackup = 'education';
    component.selectedFile = new File(['{invalid'], 'education-backup.json', { type: 'application/json' });

    await component.importBackup();

    expect(educationService.addEducation).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith('The selected file is not valid JSON.');
  });
});
