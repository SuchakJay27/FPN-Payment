import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, NgStyle, TranslateModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  //#region private Variables
  currentStep = 1;
  totalSteps = 4;
  currentPageText = "";
  nextPageText = "";
  isFPNNumber: boolean | undefined;
  formData = {
    fpnNumber: '',
    fname: '',
    lname: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    phone: '',
    email: '',
    confirmEmail: ''
  };
  currentLang: string;
  langChangeSub: Subscription
  //#endregion

  //#region Constructor
  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('appLang') || 'en';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    this.setPageText('ENTERFPN', 'CONFIRMDETAIL');
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.setPageText('ENTERFPN', 'CONFIRMDETAIL');
    });
  }
  //#endregion

  //#region Private Methods
  getProgressGradient(): string {
    const percent = (this.currentStep / this.totalSteps) * 100;
    return `conic-gradient(var(--secondary-color) 0% ${percent}%, var(--white) ${percent}% 100%)`;
  }

  resetForm() {
    this.formData.fpnNumber = '';
    this.isFPNNumber = true
  }

  checkFPNNumber() {
    if (this.formData.fpnNumber) {
      this.isFPNNumber = true;
    } else {
      this.isFPNNumber = false;
    }
  }

  setPageText(currentKey: string, nextKey: string) {
    this.translate.get([currentKey, nextKey]).subscribe(translations => {
      this.currentPageText = translations[currentKey];
      this.nextPageText = translations[nextKey];
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.charCode || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;
    return emailPattern.test(email);
  }

  validateAndNext(currentPageText: string, nextPageText: string) {
    this.checkFPNNumber();
    if (this.isFPNNumber) {
      this.nextStep(currentPageText, nextPageText);
    }
  }

  nextStep(currentPageText: string, nextPageText: string) {
    this.setPageText(currentPageText, nextPageText);
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep(currentPageText: string, nextPageText: string) {
    this.setPageText(currentPageText, nextPageText);
    if (this.currentStep > 1) this.currentStep--;
  }

  PaySecurely(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
  }
  //#endregion 


}
