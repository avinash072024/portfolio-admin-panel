import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme/theme.service';
import { Constants } from '../../models/constants';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  themeService = inject(ThemeService);
  appName = Constants.APP_NAME;
  currentYear: number = new Date().getFullYear();
  appName1: string = Constants.APP_NAME1;
  appName2: string = Constants.APP_NAME2;
}
