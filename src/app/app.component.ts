import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FPN-Payment';
  isNotFoundPage = false;
  constructor(private translate: TranslateService, private router: Router) {
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
}
