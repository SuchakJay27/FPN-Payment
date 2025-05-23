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
    country: 'GB',
    phone: '',
    email: '',
    confirmEmail: ''
  };
  currentLang: string;
  langChangeSub: Subscription;
  council: string | null = null;
  @ViewChild('fpnInput') fpnInput!: ElementRef;
  @ViewChild('ConfirmEmail') ConfirmEmail!: ElementRef;
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
  isFieldsRest = false;
  previousFPN = '';
  resetFPNDetails: any;
  paymentStatus: string | null | undefined;
  vendorTxCode: string | null | undefined;
  fln: string | null | undefined;
  reasonCode: string = '';
  btnPayNowText: string = 'Try payment again';
  paymentMsg: string | undefined;
  transactionId: string | undefined;
  paymentProcessErroTaxt = "";
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
      if (this.paymentStatus && this.vendorTxCode && this.currentStep == 4) {
        this.nextStep("CONFIRMPAYMENT", '');
      } else if (this.currentStep == 1) {
        this.setPageText('ENTERFPN', 'CONFIRMDETAIL');
      } else if (this.currentStep == 2) {
        this.setPageText('CONFIRMDETAIL', 'PAYMENTDETAILS');
      } else if (this.currentStep == 3) {
        this.setPageText('PAYMENTDETAILS', 'CONFIRMATION');
      }
    });
  }
  //#endregion

  //#region Lifecycle
  ngOnInit(): void {
    // Get the council parameter from the route snapshot
    this.route.paramMap.subscribe(params => {
      this.council = params.get('council');
      this.paymentStatus = params.get('paymentStatus')?.toLowerCase(); // success/failure
      if (this.paymentStatus) {
        this.route.queryParams.subscribe(query => {
          this.vendorTxCode = query['VendorTxCode'] || null;
          // this.fln = query['FLN'] || null;
          this.reasonCode = query['reasonCode'] || null;
          if (this.council && this.paymentStatus && this.vendorTxCode) {
            this._fpnPaymentService.getPaymentStatus(this.council.toLocaleLowerCase(), this.paymentStatus, this.vendorTxCode, this.reasonCode).subscribe({
              next: (response) => {
                if (response?.success) {
                  if (response?.data?.transactionId) {
                    this.transactionId = response?.data?.transactionId;
                  } else {
                    this.btnPayNowText = response?.data?.btnPayNowText;
                    this.paymentMsg = response?.data?.message;
                  }
                }
              },
              error: (error) => {
                if (error) {
                  if (error.status == 401) {
                    // this.showConfirmationPopUp("Invalid or expired session");
                  } else if (error.status == 500) {
                    this.showConfirmationPopUp("Invalid or expired session");
                  }
                }
              }
            });
            this.currentStep = 4;
            this.nextStep("CONFIRMPAYMENT", '');
          }
        });
      }
    });
    this.resetFPNDetails = { ...this.fpnDetails };
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
    this.isFPNNumber = true;
    this.fpnInput.nativeElement.focus();
    this.isFieldsRest = false;
    this.fpnDetails = { ...this.resetFPNDetails };
    this.previousFPN = this.fpnDetails.tktSrNo;
    this.formData.country = 'GB';
  }

  checkFPNNumber() {
    if (this.formData.fpnNumber) {
      if (this.previousFPN !== this.formData.fpnNumber) {
        this.isFieldsRest = true;
      } else {
        this.isFieldsRest = false;
      }
      this.isFPNNumber = true;

    } else {
      this.isFPNNumber = false;
      this.setFPNRequiredText('FPN_REQUIRED');
      this.fpnInput.nativeElement.focus();
      return
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
            this.getFPNDetails(currentPageText, nextPageText, response?.data?.fpnNumber);
          }
        },
        error: (error) => {
          if (error) {
            this.manageErrorMsg(error);
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
            this.previousFPN = this.fpnDetails.tktSrNo;
          } else {
            this.fpnDetails = { ...this.resetFPNDetails };
            this.previousFPN = this.fpnDetails.tktSrNo;
          }
        }
      },
      error: (error) => {
        if (error) {
          this.manageErrorMsg(error);
        }
      }
    })
  }

  manageErrorMsg(error: any) {
    this.isFPNNumber = false;
    this.fpnInput.nativeElement.focus();
    this.fpnDetails = { ...this.resetFPNDetails };
    this.previousFPN = this.fpnDetails.tktSrNo;
    this.formData.country = 'GB';
    if (error.status == 404) {
      // this.setFPNRequiredText('FPNDOESNOTEXIST');
      this.fpnNumberRequired = error?.error?.data;
    } else if (error.status == 401) {
      this.showConfirmationPopUp("Invalid or expired session");
    } else if (error.status == 500) {
      this.fpnNumberRequired = error?.error?.message;
    } else if (error.status == 409) {
      this.fpnNumberRequired = error?.error?.data;
    }
  }

  getDateFormat(dateStr: string): string {
    const date = new Date(dateStr);
    return formatDate(date, "dd-MMM-yy 'at' HH:mm", 'en-US');
  }

  nextStep(currentPageText: string, nextPageText: string) {
    this.setPageText(currentPageText, nextPageText);
    if (this.currentStep < this.totalSteps) this.currentStep++;
    if (this.isFieldsRest && this.currentStep === 3) this.resetFormData();
  }

  prevStep(currentPageText: string, nextPageText: string) {
    this.paymentProcessErroTaxt = '';
    if (!this.fpnDetails.tktSrNo) {
      this.currentStep = 1;
      this.isFieldsRest = false;
      this.setPageText('ENTERFPN', 'CONFIRMDETAIL');
    } else {
      this.setPageText(currentPageText, nextPageText);
      if (this.currentStep > 1) this.currentStep--;
      this.isFieldsRest = false;
    }
  }

  PaySecurely(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    if (this.formData.email !== this.formData.confirmEmail) {
      this.ConfirmEmail.nativeElement.focus();
      return;
    }

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
        // Remove any beforeunload handler
        window.onbeforeunload = null;
        this.paymentProcessErroTaxt = '';
        this.enableUnloadWarning = false;
        if (res?.success && res?.data && res?.data?.redirectUrl) {
          window.location.href = res?.data?.redirectUrl;
        }
      },
      error: (error) => {
        if (error.status == 404) {
          this.paymentProcessErroTaxt = error?.error?.data;
        } else if (error.status == 401) {
          this.showConfirmationPopUp("Invalid or expired session");
        } else if (error.status == 500) {
          this.paymentProcessErroTaxt = error?.error?.message;
        } else if (error.status == 409) {
          this.paymentProcessErroTaxt = error?.error?.data;
        }
      }
    })
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
          localStorage.setItem('sessionId', response?.data?.sessionId);
          localStorage.setItem('councilLogo', response?.data?.councilLogo);
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

  resetFormData() {
    this.formData.fname = '';
    this.formData.lname = '';
    this.formData.address1 = '';
    this.formData.address2 = '';
    this.formData.city = '';
    this.formData.postcode = '';
    this.formData.phone = '';
    this.formData.email = '';
    this.formData.confirmEmail = '';
    this.formData.country = 'GB';
  }

  payAgain() {
    this.router.navigate([`/${this.council}`], { replaceUrl: true });
  }
  //#endregion 


}
