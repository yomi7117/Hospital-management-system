




import { fadeInOut } from '../../services/animations';

import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { AlertService, DialogType, MessageSeverity } from '../../services/alert.service';
import { AppTranslationService } from "../../services/app-translation.service";
import { AccountService } from '../../services/account.service';
import { CustomerService } from '../../services/customer.service';
import { Utilities } from '../../services/utilities';
import { Customer } from '../../models/customer.model';
import { Permission } from '../../models/permission.model';
import { CustomerEditorComponent } from './customer-editor.component';





@Component({
  selector: 'customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
  animations: [fadeInOut]
})
export class CustomersComponent implements OnInit {

  columns: any[] = [];
  rows: Customer[] = [];
  rowsCache: Customer[] = [];
  allPermissions: Permission[] = [];
  editedCustomer: Customer;
  sourceCustomer: Customer;
  editingCustomerName: { name: string };
  loadingIndicator: boolean;
  private showValidationErrors = false;
  public formResetToggle = true;
  private isEditMode = false;
  public changesCancelledCallback: () => void;

  @Input()
  isGeneralEditor = false;

  @ViewChild('indexTemplate')
  indexTemplate: TemplateRef<any>;

  @ViewChild('actionsTemplate')
  actionsTemplate: TemplateRef<any>;

  @ViewChild('editorModal')
  editorModal: ModalDirective;

  @ViewChild('customerEditor')
  customerEditor: CustomerEditorComponent;

  @ViewChild('f')
  private form;

  constructor(private alertService: AlertService, private translationService: AppTranslationService, private accountService: AccountService, private customerService: CustomerService) {
  }


  ngOnInit() {

    let gT = (key: string) => this.translationService.getTranslation(key);

    this.columns = [
      { prop: "id", name: '#', width: 50, cellTemplate: this.indexTemplate, canAutoResize: false },
      { prop: 'name', name: gT('Name'), width: 100 },
      { prop: 'address', name: gT('Address'), width: 350 },
      { prop: 'city', name: gT('City'), width: 80 },
      { prop: 'gender', name: gT('Gender'), width: 80 },
      { name: '', width: 130, cellTemplate: this.actionsTemplate, resizeable: false, canAutoResize: false, sortable: false, draggable: false }
    ];

    this.loadData();
  }

  loadData() {
    this.alertService.startLoadingMessage();
    this.loadingIndicator = true;

    //this.customerService.getCustomers().subscribe(results => this.onDataLoadSuccessful(results[0]), error => this.onDataLoadFailed(error));

    this.customerService.getCustomers()
      .subscribe(results => {
        this.alertService.stopLoadingMessage();
        this.loadingIndicator = false;

        let customers = results;
        //let permissions = results[1];
        this.rowsCache = [...customers];
        this.rows = customers;
        console.log("this is to check", customers);
      });


  }

  onSearchChanged(value: string) {
    this.rows = this.rowsCache.filter(r => Utilities.searchArray(value, false, r.name, r.address, r.city, r.email));
  }


  onEditorModalHidden() {
    this.editingCustomerName = null;
    this.customerEditor.resetForm(true);
  }


  newCustomer() {
    this.editingCustomerName = null;
    this.sourceCustomer = null;
    this.editedCustomer = this.customerEditor.newCustomer(this.allPermissions);
    this.editorModal.show();
  }


  editCustomer(row: Customer) {
    this.editingCustomerName = { name: row.name };
    this.sourceCustomer = row;
    this.editedCustomer = this.customerEditor.editCustomer(row, this.allPermissions);
    this.editorModal.show();
    //this.loadData();
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


  deleteCustomer(row: Customer) {
    this.alertService.showDialog('Are you sure you want to delete the \"' + row.name + '\" customer?', DialogType.confirm, () => this.deleteCustomerHelper(row.id));
    console.log("this is Test", row);
  }

  deleteCustomerHelper(row: number) {

    this.alertService.startLoadingMessage("Deleting...");
    this.loadingIndicator = true;

    this.customerService.deleteCustomers(row)
      .subscribe(results => {
        this.alertService.stopLoadingMessage();
        this.loadingIndicator = false;

        //this.rowsCache = this.rowsCache.filter(item => item !== row)
        //this.rows = this.rows.filter(item => item !== row)

        console.log("this is REsult", results);
      },
        error => {
          this.alertService.stopLoadingMessage();
          this.loadingIndicator = false;

          this.alertService.showStickyMessage("Delete Error", `An error occured whilst deleting the customer.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
            MessageSeverity.error, error);
        });
  }



  get canManageRoles() {
    return this.accountService.userHasPermission(Permission.manageRolesPermission)
  }

}

