import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { SocketService } from '../../services/socket/socket.service';
import { Position, PositionsService } from '../../services/positions/positions.service';
import { Constants } from '../../models/constants';

declare var $: any;

@Component({
  selector: 'app-positions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './positions.component.html',
  styleUrl: './positions.component.scss'
})
export class PositionsComponent implements OnInit, OnDestroy {
  positions: Position[] = [];
  activePosition: Position | null = null;
  positionForm: FormGroup;
  editingPosition: Position | null = null;
  deletingPosition: Position | null = null;
  isFormVisible = false;

  private readonly formBuilder = inject(FormBuilder);
  private readonly positionsService = inject(PositionsService);
  private readonly spinner = inject(NgxSpinnerService);
  private readonly toastr = inject(ToastrService);
  private readonly socketService = inject(SocketService);
  private readonly destroy$ = new Subject<void>();

  confirmDeleteStatement: string = Constants.DELETE_CONFIRM_STATEMENT1;

  delelteStatement1: string = Constants.DELETE_STATEMENT1;
  delelteStatement2: string = Constants.DELETE_STATEMENT2;
  delelteStatement3: string = Constants.DELETE_STATEMENT3;

  constructor() {
    this.positionForm = this.formBuilder.group({
      actualPosition: ['', [Validators.required, Validators.pattern(/\S/)]],
      technicalPosition: ['', [Validators.required, Validators.pattern(/\S/)]],
      isActive: [false]
    });
  }

  ngOnInit(): void {
    this.loadPositions();
    this.socketService
      .onRefreshOrDataUpdated(['position'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadPositions(true));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPositions(silent = false): void {
    if (!silent) {
      this.spinner.show();
    }

    forkJoin({
      list: this.positionsService.getPositions(),
      active: this.positionsService.getActivePosition()
    }).subscribe({
      next: ({ list, active }) => {
        this.positions = list.positions ?? [];
        this.activePosition = active.position ?? null;
        if (!silent) {
          this.spinner.hide();
        }
      },
      error: (error) => {
        if (!silent) {
          this.spinner.hide();
        }
        this.toastr.error(error?.error?.message || error?.message || 'Failed to load positions. Please try again.');
      }
    });
  }

  openCreateForm(): void {
    this.editingPosition = null;
    this.positionForm.reset({ actualPosition: '', technicalPosition: '', isActive: false });
    this.isFormVisible = true;
    $("#AddEditPosisition").modal('show');
  }

  openEditForm(position: Position): void {
    this.editingPosition = position;
    this.positionForm.reset({
      actualPosition: position.actualPosition,
      technicalPosition: position.technicalPosition,
      isActive: position.isActive
    });
    // this.isFormVisible = true;
    $("#AddEditPosisition").modal('show');
  }

  closeForm(): void {
    // this.isFormVisible = false;
    $("#AddEditPosisition").modal('hide');
    this.editingPosition = null;
    this.positionForm.reset({ actualPosition: '', technicalPosition: '', isActive: false });
  }

  savePosition(): void {
    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    const formValue = this.positionForm.getRawValue();
    const positionFields = {
      actualPosition: formValue.actualPosition.trim(),
      technicalPosition: formValue.technicalPosition.trim()
    };

    this.spinner.show();
    const request = this.editingPosition
      ? this.positionsService.updatePosition(this.editingPosition._id, {
        ...positionFields,
        isActive: formValue.isActive === true
      })
      : this.positionsService.createPosition({
        ...positionFields,
        ...(formValue.isActive === true ? { isActive: true } : {})
      });

    request.subscribe({
      next: (response) => {
        this.spinner.hide();
        if (!response.success) {
          this.toastr.error(response.message || 'Failed to save position.');
          return;
        }
        this.toastr.success(response.message || 'Position saved successfully.');
        this.closeForm();
        this.loadPositions(true);
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error(error?.error?.message || error?.message || 'Failed to save position. Please try again.');
      }
    });
  }

  toggleActive(position: Position): void {
    this.spinner.show();
    this.positionsService.updatePosition(position._id, { isActive: !position.isActive }).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (!response.success) {
          this.toastr.error(response.message || 'Failed to update position status.');
          return;
        }
        this.toastr.success(response.message || 'Position status updated.');
        this.loadPositions(true);
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error(error?.error?.message || error?.message || 'Failed to update position status.');
      }
    });
  }

  askDelete(position: Position): void {
    this.deletingPosition = position;
    $("#DeleteConfirmationModal").modal('show');
  }

  cancelDelete(): void {
    this.deletingPosition = null;
  }

  deletePosition(): void {
    if (!this.deletingPosition) {
      return;
    }
    const position = this.deletingPosition;
    this.spinner.show();
    this.positionsService.deletePosition(position._id).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (!response.success) {
          this.toastr.error(response.message || 'Failed to delete position.');
          return;
        }
        this.deletingPosition = null;
        this.toastr.success(response.message || 'Position deleted successfully.');
        this.loadPositions(true);
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error(error?.error?.message || error?.message || 'Failed to delete position.');
      }
    });
  }

  isInvalid(field: 'actualPosition' | 'technicalPosition'): boolean {
    const control = this.positionForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
