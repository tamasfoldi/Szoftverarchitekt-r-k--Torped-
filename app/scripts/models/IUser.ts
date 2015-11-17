/// <reference path="../../../references.ts" />

module Model {

  export interface IUser extends angular.resource.IResource<IUser> {
    id?: string;
    username: string;
    password: string;
    mail: string;
  }
}
