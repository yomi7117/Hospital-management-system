

import { Permission } from './permission.model';


export class Customer {

  constructor(id?: any, name?: string, email?: string, phonenumber?: string, address?: string, city?: string, gender?: string, permissions?: Permission[]) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.phonenumber = phonenumber;
        this.address = address;
        this.city = city;
        this.gender = gender;
        this.permissions = permissions;
    }

    public id: any;
    public name: string;
    public email: string;
    public phonenumber: string;
    public address: string;
    public city: string;
    public gender: string;

    public permissions: Permission[];
}
