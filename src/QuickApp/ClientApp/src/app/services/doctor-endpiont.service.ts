import { Injectable, Injector } from '@angular/core';
import { EndpointFactory } from './endpoint-factory.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable()
export class DoctorEndpiontService extends EndpointFactory  {

  private readonly _doctorsUrl: string = "/api/doctor/get";
  private readonly _doctorsCreateUrl: string = "/api/doctor/add";
  private readonly _doctorsUpdateUrl: string = "/api/doctor/update";
  private readonly _doctorsDeleteUrl: string = "/api/doctor/delete";


  get doctorsUrl() { return this.configurations.baseUrl + this._doctorsUrl; }
  get doctorsCreateUrl() { return this.configurations.baseUrl + this._doctorsCreateUrl; }
  get doctorsUpdateUrl() { return this.configurations.baseUrl + this._doctorsUpdateUrl; }
  get doctorsDeleteUrl() { return this.configurations.baseUrl + this._doctorsDeleteUrl; }
  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector)
  }
  getDoctorsEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
    let endpointUrl = page && pageSize ? `${this._doctorsUrl}/${page}/${pageSize}` : this._doctorsUrl;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getDoctorsEndpoint(page, pageSize));
      }));
  }
  
  getNewDoctorsEndpoint<T>(doctorObject: any): Observable<T> {

    return this.http.post<T>(this.doctorsCreateUrl, JSON.stringify(doctorObject), this.getRequestHeaders()).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getNewDoctorsEndpoint(doctorObject));
      }));
  }
  getUpdateDoctorEndpoint<T>(doctorObject: any, doctorId: string): Observable<T> {
    let endpointUrl = `${this.doctorsUpdateUrl}/${doctorId}`;

    return this.http.put<T>(endpointUrl, JSON.stringify(doctorObject), this.getRequestHeaders()).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getUpdateDoctorEndpoint(doctorObject, doctorId));
      }));
  }
  getDeleteDoctorEndpoint<T>(doctorId: any): Observable<T> {
    let endpointUrl = `${this.doctorsDeleteUrl}/${doctorId}`;
  
    return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getDeleteDoctorEndpoint(doctorId));


      }));
  }
}
