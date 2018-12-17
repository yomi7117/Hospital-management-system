import { Component, Input, ViewChild, TemplateRef, DoCheck } from '@angular/core';
import { fadeInOut } from 'src/app/services/animations';
import { doctor } from 'src/app/models/doctor.model';
import { Permission } from 'src/app/models/permission.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DoctorEditorComponent } from './doctor-editor/doctor-editor.component';
import { AlertService, DialogType, MessageSeverity } from 'src/app/services/alert.service';
import { AppTranslationService } from 'src/app/services/app-translation.service';
import { AccountService } from 'src/app/services/account.service';
import { DoctorService } from 'src/app/services/doctor.service';
import { Utilities } from 'src/app/services/utilities';


@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.scss'],
  animations: [fadeInOut]
})
/** doctor component*/
export class DoctorComponent {
  /** doctor ctor */
  columns: any[] = [];
  rows: doctor[] = [];
  rowsCache: doctor[] = [];
  allPermissions: Permission[] = [];
  editedDoctor: doctor;
  sourceDoctor: doctor;
  editingDoctorName: { name: string };
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

  @ViewChild('doctorEditor')
  doctorEditor: DoctorEditorComponent;

  @ViewChild('f')
  private form;


  constructor(private alertService: AlertService, private translationService: AppTranslationService, private accountService: AccountService, private doctorService: DoctorService) {

  }
  ngOnInit() {

    let gT = (key: string) => this.translationService.getTranslation(key);

    this.columns = [
      { prop: "id", name: '#', width: 50, cellTemplate: this.indexTemplate, canAutoResize: false },
      { prop: 'name', name: gT('Name'), width: 100 },
      { prop: 'phoneNumber', name: gT('Phonenumber'), width: 100 },
      { name: '', width: 130, cellTemplate: this.actionsTemplate, resizeable: false, canAutoResize: false, sortable: false, draggable: false }
    ];
    this.loadData();
  }
  loadData() {
    this.alertService.startLoadingMessage();
    this.loadingIndicator = true;

    //this.customerService.getCustomers().subscribe(results => this.onDataLoadSuccessful(results[0]), error => this.onDataLoadFailed(error));

    this.doctorService.getDoctors()
      .subscribe(results => {
        this.alertService.stopLoadingMessage();
        this.loadingIndicator = false;

        let doctors = results;
        //let permissions = results[1];
        this.rowsCache = [...doctors];
        this.rows = doctors;
        console.log("this is to check", doctors);
      });
  }

  onSearchChanged(value: string) {
    this.rows = this.rowsCache.filter(r => Utilities.searchArray(value, false, r.name, r.phonenumber));
  }


  onEditorModalHidden() {
    this.editingDoctorName = null;
    this.doctorEditor.resetForm(true);
  }


  newDoctor() {
    this.editingDoctorName = null;
    this.sourceDoctor = null;
    this.editedDoctor = this.doctorEditor.newDoctor(this.allPermissions);
    this.editorModal.show();
  }


  editDoctor(row: doctor) {
    this.editingDoctorName = { name: row.name,  };
    this.sourceDoctor = row;
    this.editedDoctor = this.doctorEditor.editDoctor(row, this.allPermissions);
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


  deleteCustomer(row: doctor) {
    this.alertService.showDialog('Are you sure you want to delete the \"' + row.name + '\" customer?', DialogType.confirm, () => this.deleteDoctorHelper(row.id));
    console.log("this is Test", row);
  }

  deleteDoctorHelper(row: number) {

    this.alertService.startLoadingMessage("Deleting...");
    this.loadingIndicator = true;

    this.doctorService.deleteDoctors(row)
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
