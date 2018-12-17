import { Component, ViewChild } from '@angular/core';
import {  doctor } from 'src/app/models/doctor.model';
import { Permission } from 'src/app/models/permission.model';
import { DoctorService } from 'src/app/services/doctor.service';
import { AlertService, MessageSeverity } from 'src/app/services/alert.service';
import { AccountService } from 'src/app/services/account.service';

@Component({
    selector: 'app-doctor-editor',
    templateUrl: './doctor-editor.component.html',
    styleUrls: ['./doctor-editor.component.scss']
})
/** doctor.editor component*/
export class DoctorEditorComponent {
    /** doctor.editor ctor */

  private isNewDoctor = false;
  private isSaving: boolean;
  private showValidationErrors: boolean = true;
  private editingDoctorName: string;
  private doctorEdit: doctor = new doctor();
  private allPermissions: Permission[] = [];
  private selectedValues: { [key: string]: boolean; } = {};
  private isEditMode = false;

  public formResetToggle = true;

  public changesSavedCallback: () => void;
  public changesFailedCallback: () => void;
  public changesCancelledCallback: () => void;


  @ViewChild('f')
  private form;

  constructor(private alertService: AlertService, private accountService: AccountService, private doctorService: DoctorService) {
    
  }

  private showErrorAlert(caption: string, message: string) {
    this.alertService.showMessage(caption, message, MessageSeverity.error);
  }
  private save() {
    this.isSaving = true;
    this.alertService.startLoadingMessage("Saving changes...");

    this.doctorEdit.permissions = this.getSelectedPermissions();

    if (this.isNewDoctor) {
      this.doctorService.newDoctor(this.doctorEdit).subscribe(doctor => this.saveSuccessHelper(doctor), error => this.saveFailedHelper(error));
    }
    else {
      this.doctorService.updateDoctor(this.doctorEdit).subscribe(response => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
    }
  }

  private getSelectedPermissions() {
    return this.allPermissions.filter(p => this.selectedValues[p.value] == true);
  }


  private saveSuccessHelper(doctors?: doctor) {
    if (doctors)
      Object.assign(this.doctorEdit, doctors);

    this.isSaving = false;
    this.alertService.stopLoadingMessage();
    this.showValidationErrors = false;

    if (this.isNewDoctor)
      this.alertService.showMessage("Success", `Doctor \"${this.doctorEdit.name}\" was created successfully`, MessageSeverity.success);
    else
      this.alertService.showMessage("Success", `Changes to Doctor \"${this.doctorEdit.name}\" was saved successfully`, MessageSeverity.success);


    this.doctorEdit = new doctor();
    this.resetForm();


    if (!this.isNewDoctor && this.accountService.currentUser.roles.some(r => r == this.editingDoctorName))
      this.refreshLoggedInUser();

    if (this.changesSavedCallback)
      this.changesSavedCallback();
  }

  resetForm(replace = false) {

    if (!replace) {
      this.form.reset();
    }
    else {
      this.formResetToggle = false;

      setTimeout(() => {
        this.formResetToggle = true;
      });
    }
  }

  private refreshLoggedInUser() {
    this.accountService.refreshLoggedInUser()
      .subscribe(user => { },
        error => {
          this.alertService.resetStickyMessage();
          this.alertService.showStickyMessage("Refresh failed", "An error occured whilst refreshing logged in user information from the server", MessageSeverity.error, error);
        });
  }

  private cancel() {
    this.doctorEdit = new doctor();

    this.showValidationErrors = false;
    this.resetForm();
    alert("ok");
    this.alertService.showMessage("Cancelled", "Operation cancelled by user", MessageSeverity.default);
    alert("ok");
    this.alertService.resetStickyMessage();
    alert("ok");
    if (this.changesCancelledCallback)
      alert("ok");
      this.changesCancelledCallback;
  }

  private saveFailedHelper(error: any) {
    this.isSaving = false;
    this.alertService.stopLoadingMessage();
    this.alertService.showStickyMessage("Save Error", "The below errors occured whilst saving your changes:", MessageSeverity.error, error);
    this.alertService.showStickyMessage(error, null, MessageSeverity.error);

    if (this.changesFailedCallback)
      this.changesFailedCallback();
  }
  private selectAll() {
    this.allPermissions.forEach(p => this.selectedValues[p.value] = true);
  }


  private selectNone() {
    this.allPermissions.forEach(p => this.selectedValues[p.value] = false);
  }


  private toggleGroup(groupName: string) {
    let firstMemberValue: boolean;

    this.allPermissions.forEach(p => {
      if (p.groupName != groupName)
        return;

      if (firstMemberValue == null)
        firstMemberValue = this.selectedValues[p.value] == true;

      this.selectedValues[p.value] = !firstMemberValue;
    });
  }


  newDoctor(allPermissions: Permission[]) {
    this.isNewDoctor = true;
    this.showValidationErrors = true;

    this.editingDoctorName = null;
    this.allPermissions = allPermissions;
    this.selectedValues = {};
    this.doctorEdit = new doctor();

    return this.doctorEdit;
  }

  editDoctor(doctors: doctor, allPermissions: Permission[]) {
    if (doctors) {
      this.isNewDoctor = false;
      this.showValidationErrors = true;

      this.editingDoctorName = doctors.name;
      this.allPermissions = allPermissions;
      this.selectedValues = {};
     
      this.doctorEdit = new doctor();
      Object.assign(this.doctorEdit, doctors);

      return this.doctorEdit;
    }
    else {
      return this.newDoctor(allPermissions);
    }
  }



  get canManageRoles() {
    return this.accountService.userHasPermission(Permission.manageRolesPermission)
  }
}
