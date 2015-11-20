/// <reference path="../../../references.ts" />

module Model {

  export interface IUser extends angular.resource.IResource<IUser> {
    username: string;
    password: string;
    gender: string;
    about: string;

    picUrl: string;
  }
}
