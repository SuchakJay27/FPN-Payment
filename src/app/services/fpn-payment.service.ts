import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FpnPaymentService {
  private apiBaseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) { }

  //#region
  /**
   * Retrieves council data from the API
   * @param council - council
   * @returns Observable<any>
   */
  validateCouncilData(council: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/fpn/validatecouncil/${council}`, {
      headers: { 'Accept-Language': 'en' }
    });
  }

  /**
 * Validates the FPN number using the backend API
 * @param fpnNumber - FPN number to validate
 * @returns Observable<any>
 */
  validateFPNNumber(fpnNumber: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-Session-Id': localStorage.getItem('sessionId')!
    });
    const params = new HttpParams().set('fpnNumber', fpnNumber);
    return this.http.get<any>(`${this.apiBaseUrl}/fpn/validatefpnnumber`, { headers, params });
  }

  /**
  * Get the FPN Details using the backend API
  * @param fpnNumber - FPN number to fetch details for
  * @returns Observable<any>
  */
  getFPNDetails(fpnNumber: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-Session-Id': localStorage.getItem('sessionId')!
    });
    const params = new HttpParams().set('fpnNumber', fpnNumber);
    return this.http.get<any>(`${this.apiBaseUrl}/fpn/getfpndetails`, { headers, params });
  }

  /**
 * Payment Proceed using the backend API
 * @param payload - details of Payment
 * @returns Observable<any>
 */
  processPayment(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'X-Session-Id': localStorage.getItem('sessionId')!
    });
    return this.http.post<any>(`${this.apiBaseUrl}/payment/processpayment`, payload, { headers });
  }
  //#endregion

}
