import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FpnPaymentService {
  private apiBaseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) { }

  //#region Get Location Data
  /**
   * Retrieves city/location data from the API
   * @param location - city or location
   * @returns Observable<any>
   */
  getCityData(location: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/${location}`); // update with actual API when available
  }
  //#endregion

}
