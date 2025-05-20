import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FpnPaymentService } from './services/fpn-payment.service';
import { filter } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  //#region private Variables
  title = 'FPN-Payment';
  isNotFoundPage!: boolean;
  council: string | null = null;
  loadingCouncil = true;
  //#endregion

  //#region Constructor
  constructor(private translate: TranslateService, private router: Router,
    private _fpnPaymentService: FpnPaymentService, private route: ActivatedRoute,
    private titleService: Title) {
    let setlang = localStorage.getItem('appLang')
    if (setlang) {
      this.translate.setDefaultLang(setlang);
    } else {
      localStorage.setItem('appLang', 'en');
      this.translate.setDefaultLang('en');
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isNotFoundPage = event.urlAfterRedirects === '/page-not-found';
      }
    });
  }
  //#endregion

  //#region Lifecycle
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadingCouncil = true;
      // Get the council parameter from the route snapshot
      this.council = this.route.snapshot.firstChild?.paramMap.get('council')!;
      if (this.council) {
        this.titleService.setTitle(this.toTitleCase(this.council));
        this.validateCouncilData(this.council)
      } else {
        this.loadingCouncil = false;
      }
    });
  }
  //#endregion

  //#region Private Methods
  validateCouncilData(council: string): void {
    // Call your API or service to get data for the council
    this._fpnPaymentService.validateCouncilData(council).subscribe({
      next: (response) => {
        if (response && response?.success) {
          this.loadingCouncil = false;
          localStorage.setItem('sessionId', response?.data?.sessionId)
        }
      },
      error: (err) => {
        this.loadingCouncil = false;
        this.router.navigateByUrl('/page-not-found');
      }
    });
  }

  toTitleCase(str: string): string {
    if (!str) {
      return "";
    }
    return str.toLowerCase().split(' ').map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }
  //#endregion


}
