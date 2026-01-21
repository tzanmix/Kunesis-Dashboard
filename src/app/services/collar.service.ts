import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Matches com.sensecampus.kuncollar.dto.CollarStatusDTO
export interface CollarStatusDTO {
  collarId: string;
  lastSeenTs: number;
  lat: number;
  lon: number;
  batteryMv: number;
  dogTempC: number;
  activityState: string;
  lastLeqDb: number;
  barkCount: number;
  pantingIndex?: number;
  respRateBpm?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CollarService {
  private http = inject(HttpClient);
  
  // environment variable MUST be used here for apiUrl
  private apiUrl = 'http://localhost:8080/api/v1/collars'; 

  getLatestStatus(collarId: string): Observable<CollarStatusDTO> {
    return this.http.get<CollarStatusDTO>(`${this.apiUrl}/${collarId}/status`);
  }
}