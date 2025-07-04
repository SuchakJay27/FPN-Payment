import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private _modalConfirmedSubject = new BehaviorSubject<boolean | null>(null);
  enableUnloadWarning$ = this._modalConfirmedSubject.asObservable();
  constructor() { }

  async showModalPopup(message: string, htmlContent: string, iconText: any,
    options: {
      showConfirmButton?: boolean,
      showCancelButton?: boolean,
      confirmButtonText?: string,
      cancelButtonText?: string
    } = {}
  ): Promise<'confirm' | 'cancel'> {
    this._modalConfirmedSubject.next(false);
    const result = await Swal.fire({
      // title: options.showConfirmButton ? 'Confirmation' : '',
      text: message ? message : '',
      html: htmlContent ? htmlContent : '',
      icon: iconText ? iconText : '',
      showConfirmButton: options.showConfirmButton ?? false,
      showCancelButton: options.showCancelButton ?? true,
      confirmButtonText: options.confirmButtonText || 'Yes',
      cancelButtonText: options.cancelButtonText || (options.showConfirmButton ? 'No' : 'OK'),
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        // Add alt tag to hidden image
        const img = document.querySelector('.swal2-image') as HTMLImageElement;
        if (img && !img.hasAttribute('alt')) {
          img.setAttribute('alt', '');
        }

        // Remove unnecessary/empty input elements
        const elementsToRemove = [
          '.swal2-input',
          '.swal2-file',
          '.swal2-textarea',
          '.swal2-select',
          '.swal2-range',
          '.swal2-checkbox'
        ];
        elementsToRemove.forEach(selector => {
          const el = document.querySelector(selector);
          if (el) {
            el.setAttribute('aria-hidden', 'true');
            el.remove();
          }
        });

        // Remove empty title
        const titleEl = document.getElementById('swal2-title');
        if (titleEl && titleEl.textContent?.trim() === '') {
          titleEl.remove();
          document.querySelector('.swal2-popup')?.removeAttribute('aria-labelledby');
        }

        // Remove empty html content
        const descEl = document.getElementById('swal2-html-container');
        if (descEl && descEl.textContent?.trim() === '') {
          descEl.remove();
          document.querySelector('.swal2-popup')?.removeAttribute('aria-describedby');
        }

        // Add fallback aria-label if both title and html are gone
        const popup = document.querySelector('.swal2-popup');
        if (popup && !popup.getAttribute('aria-label') && !popup.hasAttribute('aria-labelledby')) {
          popup.setAttribute('aria-label', 'Dialog');
        }
      }
    });
    return result.isConfirmed ? 'confirm' : 'cancel';
  }
}
