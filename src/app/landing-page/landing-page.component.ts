import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  currentStep = 1;
  totalSteps = 4;
  currentPageText = "Enter FPN";
  nextPageText = "Confirm Details"
  formData = {
    fpnNumber: '',
    fname: '',
    lname: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: '',
    phone: '',
    email: '',
    confirmEmail: ''
  };

  getProgressGradient(): string {
    const percent = (this.currentStep / this.totalSteps) * 100;
    console.log(percent, "percent")
    return `conic-gradient(var(--secondary-color) 0% ${percent}%, var(--white) ${percent}% 100%)`;
  }
  resetForm() {
    this.formData.fpnNumber = '';
  }
  nextStep(currentPageText: string, nextPageText: string) {
    this.currentPageText = currentPageText
    this.nextPageText = nextPageText
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep(currentPageText: string, nextPageText: string) {
    this.currentPageText = currentPageText
    this.nextPageText = nextPageText
    if (this.currentStep > 1) this.currentStep--;
  }

}
