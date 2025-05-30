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

  async showModalPopup(message: string, htmlContent:string, iconText:any,
      options: {
        showConfirmButton?: boolean,
        showCancelButton?: boolean,
        confirmButtonText?: string,
        cancelButtonText?: string
      } = {}
    ): Promise<'confirm' | 'cancel'> {
      this._modalConfirmedSubject.next(false);
      const result = await Swal.fire({
         title: options.showConfirmButton ? 'Confirmation' : '',
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
       });
       return result.isConfirmed ? 'confirm' : 'cancel';
    } 
}
