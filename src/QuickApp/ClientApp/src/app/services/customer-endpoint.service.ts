// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EndpointFactory } from './endpoint-factory.service';
import { ConfigurationService } from './configuration.service';


@Injectable()
export class CustomerEndpoint extends EndpointFactory {

  private readonly _customersUrl: string = "/api/customer/get";
  private readonly _customersCreateUrl: string = "/api/customer/add";
  private readonly _customersUpdateUrl: string = "/api/customer/update";
  private readonly _customersDeleteUrl: string = "/api/customer/delete";

  get customersUrl() { return this.configurations.baseUrl + this._customersUrl; }
  get customersCreateUrl() { return this.configurations.baseUrl + this._customersCreateUrl; }
  get customersUpdateUrl() { return this.configurations.baseUrl + this._customersUpdateUrl; }
  get customersDeleteUrl() { return this.configurations.baseUrl + this._customersDeleteUrl; }



  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {

    super(http, configurations, injector);
  }

   /////change to customer End point service

  getCustomersEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
    let endpointUrl = page && pageSize ? `${this.customersUrl}/${page}/${pageSize}` : this.customersUrl;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getCustomersEndpoint(page, pageSize));
      }));
  }


  getNewCustomerEndpoint<T>(customerObject: any): Observable<T> {

    return this.http.post<T>(this.customersCreateUrl, JSON.stringify(customerObject), this.getRequestHeaders()).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getNewCustomerEndpoint(customerObject));
      }));
  }

  getUpdateCustomerEndpoint<T>(customerObject: any, customerId: string): Observable<T> {
    let endpointUrl = `${this.customersUpdateUrl}/${customerId}`;

    return this.http.put<T>(endpointUrl, JSON.stringify(customerObject), this.getRequestHeaders()).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getUpdateCustomerEndpoint(customerObject, customerId));
      }));
  }

  getDeleteCustomerEndpoint<T>(customerId: any): Observable<T> {
    let endpointUrl = `${this.customersDeleteUrl}/${customerId}`;
    //console.log("differ in Test", `${this.customersDeleteUrl}/${customerId}`);
    return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getDeleteCustomerEndpoint(customerId));

        
      }));
  }



}
