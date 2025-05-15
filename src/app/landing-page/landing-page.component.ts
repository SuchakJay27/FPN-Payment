import { NgStyle } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { FpnPaymentService } from '../services/fpn-payment.service';
import { ToastrService, ToastNoAnimation } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, NgStyle, TranslateModule],
  providers: [
    { provide: ToastrService, useClass: ToastrService },
    { provide: ToastNoAnimation, useClass: ToastNoAnimation }
  ],
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
    council: '',
    postcode: '',
    country: 'United Kingdom',
    phone: '',
    email: '',
    confirmEmail: ''
  };
  currentLang: string;
  langChangeSub: Subscription;
  council: string | null = null;
  @ViewChild('fpnInput') fpnInput!: ElementRef;
  //#endregion

  //#region Constructor
  constructor(private translate: TranslateService, private _fpnPaymentService: FpnPaymentService,
    private _toastrService: ToastrService, private router: Router, private route: ActivatedRoute) {
    const savedLang = localStorage.getItem('appLang') || 'en';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    this.setPageText('ENTERFPN', 'CONFIRMDETAIL');
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.setPageText('ENTERFPN', 'CONFIRMDETAIL');
    });
  }
  //#endregion

  //#region Lifecycle
  ngOnInit(): void {
    // Get the council parameter from the route snapshot
    this.council = this.route.snapshot?.paramMap.get('council')!;
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
      setTimeout(() => {
        this.fpnInput.nativeElement.focus();
      });
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
      this._fpnPaymentService.validateFPNNumber(this.formData.fpnNumber).subscribe({
        next: (response) => {
          if (response.success) {
            this.nextStep(currentPageText, nextPageText);
          }
        },
        error: (error) => {
          if (error.status == 404) {
            this._toastrService.error("FPN Number Doesn't exist");
          } else if (error.status == 401) {
            this.showConfirmationPopUp("Invalid or expired session");
          }
        }
      });
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

  validFpnNumber(event: KeyboardEvent, inputValue: string): boolean {
    const charCode = event.charCode || event.keyCode;

    // Limit to 15 characters
    if (inputValue.length >= 15 && event.key !== 'Backspace' && event.key !== 'Delete') {
      event.preventDefault();
      return false;
    }
    if (!(charCode >= 48 && charCode <= 57) && // numbers 0-9
      !(charCode >= 65 && charCode <= 90) && // uppercase A-Z
      !(charCode >= 97 && charCode <= 122)) { // lowercase a-z
      event.preventDefault();
      return false;
    }
    return true;
  }

  showConfirmationPopUp(showMsg: string) {
    Swal.fire({
      // title: 'Are you sure?',
      text: showMsg,
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: 'OK',
      cancelButtonColor: '#6c757d',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (!result.isConfirmed) {
        if (this.council) {
          this.validateCouncilData(this.council);
          this.resetForm();
        }
      }
    });
  }

  validateCouncilData(council: string): void {
    // Call your API or service to get data for the council
    this._fpnPaymentService.validateCouncilData(council).subscribe({
      next: (response) => {
        if (response.success) {
          localStorage.setItem('sessionId', response.data.sessionId)
        }
      },
      error: (err) => {
        this.router.navigateByUrl('/page-not-found');
      }
    });
  }
  //#endregion 


}
