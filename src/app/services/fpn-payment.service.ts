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
   * Retrieves council/location data from the API
   * @param location - council or location
   * @returns Observable<any>
   */
  validateCouncilData(location: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}fpn/validatecouncil/${location}`,{
      headers: { 'Accept-Language':'en'}
    }); // update with actual API when available
  }
  //#endregion

}
