import { CommonModule, formatDate, NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { FpnPaymentService } from '../services/fpn-payment.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, NgStyle, TranslateModule, CommonModule],
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
    country: 'UK',
    phone: '',
    email: '',
    confirmEmail: ''
  };
  currentLang: string;
  langChangeSub: Subscription;
  council: string | null = null;
  @ViewChild('fpnInput') fpnInput!: ElementRef;
  fpnNumberRequired: string | undefined;
  fpnDetails: any = {
    tktSrNo: '',
    issueDate: '',
    otherProdName: '',
    tktName: '',
    parentTktName: '',
    amt: '',
    fpnDesc: '',
    locAdd1: '',
    locArea: '',
    title: '',
    fName: '',
    lName: '',
    add1: '',
    add2: '',
    town: '',
    postCode: '',
    gender: '',
    dob: null
  };
  enableUnloadWarning = true;
  //#endregion

  //#region Constructor
  constructor(private translate: TranslateService, private _fpnPaymentService: FpnPaymentService,
    private router: Router, private route: ActivatedRoute) {
    const savedLang = localStorage.getItem('appLang') || 'en';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    this.setPageText('ENTERFPN', 'CONFIRMDETAIL');
    this.setFPNRequiredText('FPN_REQUIRED');
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
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.enableUnloadWarning) {
      $event.preventDefault();
      $event.returnValue = '';
    }
  }

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
      this.setFPNRequiredText('FPN_REQUIRED');
      this.fpnInput.nativeElement.focus();
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
          if (response && response?.success) {
            this.getFPNDetails(currentPageText, nextPageText, response?.data?.fpnNumber)
          }
        },
        error: (error) => {
          if (error) {
            this.manageErrorMsg(error)
          }
        }
      });
    }
  }

  getFPNDetails(currentPageText: string, nextPageText: string, fpnNumber: string) {
    this._fpnPaymentService.getFPNDetails(fpnNumber).subscribe({
      next: (res) => {
        if (res.success) {
          this.nextStep(currentPageText, nextPageText);
          if (res?.data && res?.data?.length > 0) {
            this.fpnDetails = { ...this.fpnDetails, ...res?.data[0] };
          } else {
            this.fpnDetails = { ...this.fpnDetails };
          }
        }
      },
      error: (error) => {
        if (error) {
          this.manageErrorMsg(error)
        }
      }
    })
  }

  manageErrorMsg(error: any) {
    if (error.status == 404) {
      // this.setFPNRequiredText('FPNDOESNOTEXIST');
      this.fpnNumberRequired = error?.error?.data;
      this.isFPNNumber = false;
      this.fpnInput.nativeElement.focus();
    } else if (error.status == 401) {
      this.showConfirmationPopUp("Invalid or expired session");
    }else if(error.status == 500){
      this.isFPNNumber = false;
      this.fpnInput.nativeElement.focus();
      this.fpnNumberRequired = error?.error?.message;
    }
  }

  getDateFormat(dateStr: string): string {
    const date = new Date(dateStr);
    return formatDate(date, "dd-MMM-yy 'at' HH:mm", 'en-US');
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
    } else {
      let payload = {
        "firstName": this.formData.fname,
        "lastName": this.formData.lname,
        "add1": this.formData.address1,
        "add2": this.formData.address2,
        "city": this.formData.city,
        "postcode": this.formData.postcode,
        "country": this.formData.country,
        "phone": this.formData.phone,
        "email": this.formData.confirmEmail,
      }
      this._fpnPaymentService.processPayment(payload).subscribe({
        next: (res) => {
          // console.log(res, "res");
        },
        error: (error) => {
          // console.log('error', error)
        }
      })
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
        if (response && response?.success) {
          localStorage.setItem('sessionId', response?.data?.sessionId)
        }
      },
      error: (err) => {
        this.router.navigateByUrl('/page-not-found');
      }
    });
  }

  setFPNRequiredText(currentText: string) {
    this.translate.get([currentText]).subscribe(translations => {
      this.fpnNumberRequired = translations[currentText];
    });
  }
  //#endregion 


}
