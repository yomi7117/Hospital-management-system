
import { Permission } from './permission.model';


export class doctor
    {

  constructor(id?: any, name?: string, phonenumber?: string, permissions?: Permission[]) {

    this.id = id;
    this.name = name;
    this.phonenumber = phonenumber;
    this.permissions = permissions;
  }

  public id: any;
  public name: string;
  public phonenumber: string;


  public permissions: Permission[];
    }

