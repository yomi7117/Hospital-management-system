import { Injectable } from '@angular/core';
import { doctor } from '../models/doctor.model';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AccountEndpoint } from './account-endpoint.service';
import { DoctorEndpiontService } from './doctor-endpiont.service';
import { PermissionValues } from '../models/permission.model';
import { tap } from 'rxjs/operators';

export type RolesChangedOperation = "add" | "delete" | "modify";
export type DoctorsChangedEventArg = { doctors: doctor[] | string[], operation: RolesChangedOperation };


@Injectable()
export class DoctorService {
  public static readonly doctorAddedOperation: RolesChangedOperation = "add";
  public static readonly doctorDeletedOperation: RolesChangedOperation = "delete";
  public static readonly doctorModifiedOperation: RolesChangedOperation = "modify";


  private _doctorsChanged = new Subject<DoctorsChangedEventArg>();
  constructor(private router: Router, private http: HttpClient, private authService: AuthService,
    private accountEndpoint: AccountEndpoint, private doctorEndpoint: DoctorEndpiontService) {

  }
  userHasPermission(permissionValue: PermissionValues): boolean {
    return this.permissions.some(p => p == permissionValue);
  }
 
 

  onDoctorsUserCountChanged(doctors: doctor[] | string[]) {
    return this.onDoctorsChanged(doctors, DoctorService.doctorModifiedOperation);
  }

  refreshLoggedInUser() {
    return this.authService.refreshLogin();
  }
  getDoctors(page?: number, pageSize?: number) {

    return this.doctorEndpoint.getDoctorsEndpoint<doctor[]>(page, pageSize);
  }
  updateDoctor(doctor: doctor) {
    if (doctor.id) {
      return this.doctorEndpoint.getUpdateDoctorEndpoint(doctor, doctor.id).pipe(
        tap(data => this.onDoctorsChanged([doctor], DoctorService.doctorModifiedOperation)));
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
  newDoctor(doctor: doctor) {
    return this.doctorEndpoint.getNewDoctorsEndpoint<doctor>(doctor).pipe<doctor>(
      tap(data => this.onDoctorsChanged([doctor], DoctorService.doctorAddedOperation)));
  }


  deleteDoctors(doctorOrDoctorId: number): Observable<boolean> {

    //if (typeof customerOrCustomerId === 'number') {
    return this.doctorEndpoint.getDeleteDoctorEndpoint<boolean>(doctorOrDoctorId).pipe<boolean>(
      tap(data => DoctorService.doctorDeletedOperation));
    //}

  }
  getDoctorsChangedEvent(): Observable<DoctorsChangedEventArg> {
    return this._doctorsChanged.asObservable();
  }
  private onDoctorsChanged(doctors: doctor[] | string[], op: RolesChangedOperation) {
   // this._doctorsChanged.next({ doctors: doctors, operation: op });
    this._doctorsChanged.next({ doctors: doctors, operation: op });
  }


  get permissions(): PermissionValues[] {
    return this.authService.userPermissions;

  }
  get currentUser() {
    return this.authService.currentUser;
  }
}
