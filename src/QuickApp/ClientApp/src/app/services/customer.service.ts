

import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';




import { AccountEndpoint } from './account-endpoint.service';
import { AuthService } from './auth.service';
import { Permission, PermissionNames, PermissionValues } from '../models/permission.model';
import { Customer } from '../models/customer.model';
import { CustomerEndpoint } from './customer-endpoint.service';



export type RolesChangedOperation = "add" | "delete" | "modify";
export type CustomersChangedEventArg = { customers: Customer[] | string[], operation: RolesChangedOperation };



@Injectable()
export class CustomerService {

  public static readonly customerAddedOperation: RolesChangedOperation = "add";
  public static readonly customerDeletedOperation: RolesChangedOperation = "delete";
  public static readonly customerModifiedOperation: RolesChangedOperation = "modify";

  private _customersChanged = new Subject<CustomersChangedEventArg>();


  constructor(private router: Router, private http: HttpClient, private authService: AuthService,
    private accountEndpoint: AccountEndpoint, private customerEndpoint: CustomerEndpoint) {

  }


  userHasPermission(permissionValue: PermissionValues): boolean {
    return this.permissions.some(p => p == permissionValue);
  }


  refreshLoggedInUser() {
    return this.authService.refreshLogin();
  }


  getCustomers(page?: number, pageSize?: number) {

    return this.customerEndpoint.getCustomersEndpoint<Customer[]>(page, pageSize);
  }

  updateCustomer(customer: Customer) {
    if (customer.id) {
      return this.customerEndpoint.getUpdateCustomerEndpoint(customer, customer.id).pipe(
        tap(data => this.onCustomersChanged([customer], CustomerService.customerModifiedOperation)));
    }
    //else {
    //  return this.accountEndpoint.getCustomerByCustomerNameEndpoint<Customer>(customer.name).pipe<Customer>(
    //    mergeMap(foundCustomer => {
    //      customer.id = foundCustomer.id;
    //      return this.accountEndpoint.getUpdateCustomerEndpoint(customer, customer.id)
    //    }),
    //    tap(data => this.onCustomersChanged([customer], CustomerService.customerModifiedOperation)));
    //}
  }


  newCustomer(customer: Customer) {
    return this.customerEndpoint.getNewCustomerEndpoint<Customer>(customer).pipe<Customer>(
      tap(data => this.onCustomersChanged([customer], CustomerService.customerAddedOperation)));
  }


  deleteCustomers(customerOrCustomerId: number): Observable<boolean> {

    //if (typeof customerOrCustomerId === 'number') {
    return this.customerEndpoint.getDeleteCustomerEndpoint<boolean>(customerOrCustomerId).pipe<boolean>(
        tap(data =>CustomerService.customerDeletedOperation));
    //}
    
  }

  getPermissions() {

    return this.accountEndpoint.getPermissionsEndpoint<Permission[]>();
  }


  private onCustomersChanged(customers: Customer[] | string[], op: RolesChangedOperation) {
    this._customersChanged.next({ customers: customers, operation: op });
  }


  onCustomersUserCountChanged(customers: Customer[] | string[]) {
    return this.onCustomersChanged(customers, CustomerService.customerModifiedOperation);
  }


  getCustomersChangedEvent(): Observable<CustomersChangedEventArg> {
    return this._customersChanged.asObservable();
  }



  get permissions(): PermissionValues[] {
    return this.authService.userPermissions;

  }
  get currentUser() {
    return this.authService.currentUser;
  }
}
