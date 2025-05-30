import { Component, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  constructor(private _modalService: ModalService, private translate: TranslateService) { }
  //#endregion

  //#region Private Methods
  contactUs() {
    let retryLinkMessage = this.translate.instant('CONTACT_US_MESSAGE_1');
    let helplineMessage = this.translate.instant('CONTACT_US_MESSAGE_2');
    let message = `<div class="pt-4">
      ${retryLinkMessage} 
      <a href="${window.location.href}" style="color:#3085d6;">${this.council}</a><br/><br/>
       ${helplineMessage} 
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
