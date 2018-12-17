
import { Component, ViewChild } from '@angular/core';

import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AccountService } from "../../services/account.service";
import { Customer } from '../../models/customer.model';
import { Permission } from '../../models/permission.model';
import { CustomerService } from '../../services/customer.service';


@Component({
    selector: 'customer-editor',
    templateUrl: './customer-editor.component.html',
    styleUrls: ['./customer-editor.component.css']
})
export class CustomerEditorComponent {

    private isNewCustomer = false;
    private isSaving: boolean;
    private showValidationErrors: boolean = true;
    private editingCustomerName: string;
    private customerEdit: Customer = new Customer();
    private allPermissions: Permission[] = [];
    private selectedValues: { [key: string]: boolean; } = {};
    private isEditMode = false;

    public formResetToggle = true;

    public changesSavedCallback: () => void;
    public changesFailedCallback: () => void;
    public changesCancelledCallback: () => void;


    @ViewChild('f')
    private form;



  constructor(private alertService: AlertService, private accountService: AccountService, private customerService: CustomerService) {
    }



    private showErrorAlert(caption: string, message: string) {
        this.alertService.showMessage(caption, message, MessageSeverity.error);
    }


    private save() {
        this.isSaving = true;
        this.alertService.startLoadingMessage("Saving changes...");

        this.customerEdit.permissions = this.getSelectedPermissions();

        if (this.isNewCustomer) {
          this.customerService.newCustomer(this.customerEdit).subscribe(customer => this.saveSuccessHelper(customer), error => this.saveFailedHelper(error));
        }
        else {
          this.customerService.updateCustomer(this.customerEdit).subscribe(response => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
        }
    }




    private saveSuccessHelper(customer?: Customer) {
        if (customer)
            Object.assign(this.customerEdit, customer);

        this.isSaving = false;
        this.alertService.stopLoadingMessage();
        this.showValidationErrors = false;

        if (this.isNewCustomer)
            this.alertService.showMessage("Success", `Customer \"${this.customerEdit.name}\" was created successfully`, MessageSeverity.success);
        else
            this.alertService.showMessage("Success", `Changes to customer \"${this.customerEdit.name}\" was saved successfully`, MessageSeverity.success);


        this.customerEdit = new Customer();
        this.resetForm();


        if (!this.isNewCustomer && this.accountService.currentUser.roles.some(r => r == this.editingCustomerName))
            this.refreshLoggedInUser();

        if (this.changesSavedCallback)
            this.changesSavedCallback();
    }


    private refreshLoggedInUser() {
        this.accountService.refreshLoggedInUser()
            .subscribe(user => { },
            error => {
                this.alertService.resetStickyMessage();
                this.alertService.showStickyMessage("Refresh failed", "An error occured whilst refreshing logged in user information from the server", MessageSeverity.error, error);
            });
    }



    private saveFailedHelper(error: any) {
        this.isSaving = false;
        this.alertService.stopLoadingMessage();
        this.alertService.showStickyMessage("Save Error", "The below errors occured whilst saving your changes:", MessageSeverity.error, error);
        this.alertService.showStickyMessage(error, null, MessageSeverity.error);

        if (this.changesFailedCallback)
            this.changesFailedCallback();
    }


    private cancel() {
      this.customerEdit = new Customer();

      this.showValidationErrors = false;
      this.resetForm();
        this.alertService.showMessage("Cancelled", "Operation cancelled by user", MessageSeverity.default);
        this.alertService.resetStickyMessage();

   
        if (this.changesCancelledCallback)
            this.changesCancelledCallback();
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


    private getSelectedPermissions() {
        return this.allPermissions.filter(p => this.selectedValues[p.value] == true);
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

    newCustomer(allPermissions: Permission[]) {
        this.isNewCustomer = true;
        this.showValidationErrors = true;

        this.editingCustomerName = null;
        this.allPermissions = allPermissions;
        this.selectedValues = {};
        this.customerEdit = new Customer();

        return this.customerEdit;
    }

    editCustomer(customer: Customer, allPermissions: Permission[]) {
        if (customer) {
            this.isNewCustomer = false;
            this.showValidationErrors = true;

            this.editingCustomerName = customer.name;
            this.allPermissions = allPermissions;
            this.selectedValues = {};
            //customer.permissions.forEach(p => this.selectedValues[p.value] = true);
            this.customerEdit = new Customer();
            Object.assign(this.customerEdit, customer);

            return this.customerEdit;
        }
        else {
            return this.newCustomer(allPermissions);
        }
    }



    get canManageRoles() {
        return this.accountService.userHasPermission(Permission.manageRolesPermission)
    }
}
