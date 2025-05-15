import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  //#region private Variables
  currentLang: string;
  //#endregion

  //#region Constructor
  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('appLang') || 'en';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
  }
  //#endregion

  //#region Private Methods
  ChangeLang() {
    this.currentLang = this.currentLang === 'en' ? 'cymraeg' : 'en';
    this.translate.use(this.currentLang);
    localStorage.setItem('appLang', this.currentLang);
  }

  getToggleLangLabel(): string {
    return this.currentLang === 'en' ? 'CYMRAEG' : 'ENGLISH';
  }
  //#endregion

}
