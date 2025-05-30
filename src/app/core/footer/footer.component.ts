import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  //#region private Variables
  @Input() council: any;
  //#endregion

  //#region Constructor
  constructor(private _modalService: ModalService) { }
  //#endregion

  //#region Private Methods
  contactUs() {
    let message = `<div class="pt-4">
      If you would like to try entering the details again please follow this link: 
      <a href="${window.location.href}" style="color:#3085d6;">${this.council}</a><br/><br/>
      If you would like to speak with our payment helpline, please call 0800 781 6229.
      </div>
    `;
    this.showConfirmationPopUp(message);
  }

  showConfirmationPopUp(showMsg: string) {
    this._modalService.showModalPopup('', showMsg, '', {
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'CLOSE'
    }).then(result => {
      if (result === 'cancel') {
      }
    });
  }
  //#endregion

}
