import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
    visible = false;
    title = 'Confirm';
    message = 'Are you sure?';
    itemName = '';
    sectionName = ''

    private resolver: ((value: boolean) => void) | null = null;

    open(title = 'Confirm', message = 'Are you sure?', itemName = this.itemName, sectionName = this.sectionName): Promise<boolean> {
        this.title = title;
        this.message = message;
        this.itemName = itemName;
        this.sectionName = sectionName;

        this.visible = true;
        return new Promise<boolean>((resolve) => {
            this.resolver = resolve;
        });
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydown(ev: KeyboardEvent) {
        if (!this.visible) return;
        if (ev.key === 'Escape') {
            // static backdrop: ignore Escape
            ev.preventDefault();
            ev.stopPropagation();
        }
    }

    close(result: boolean) {
        this.visible = false;
        if (this.resolver) {
            this.resolver(result);
            this.resolver = null;
        }
    }
}
