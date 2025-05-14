import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FpnPaymentService } from './services/fpn-payment.service';
import { filter } from 'rxjs';

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
  isNotFoundPage = false;
  city: string | null = null;
  //#endregion

  //#region Constructor
  constructor(private translate: TranslateService, private router: Router,
    private _locationService: FpnPaymentService, private route: ActivatedRoute) {
    let setlang = localStorage.getItem('appLang')
    if (setlang) {
      this.translate.setDefaultLang(setlang);
    } else {
      localStorage.setItem('appLang', 'en');
      this.translate.setDefaultLang('en');
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isNotFoundPage = event.urlAfterRedirects === '/404';
      }
    });
  }
  //#endregion

  //#region Lifecycle
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Get the city parameter from the route snapshot
      this.city = this.route.snapshot.firstChild?.paramMap.get('city')!;
      if (this.city) {
        // this.getCityDatayData(this.city)
      }
    });
  }
  //#endregion

  //#region Private Methods
  getCityDatayData(city: string): void {
    // Call your API or service to get data for the city
    this._locationService.getCityData(city).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  //#endregion


}
