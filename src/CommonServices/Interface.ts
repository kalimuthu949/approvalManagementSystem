//PeoplePicker Details:
export interface IPeoplePickerDetails {
  id: number;
  name: string;
  email: string;
}
//sideNav Details:
export interface ISideNavDetails {
  img: any;
  name: string;
  pageName: string;
}
//ListNames Details:
export interface IListNames {
  CategoryConfig: string;
}
//CategoryConfig Details:
export interface ICategoryDetails {
  id: number;
  category: string;
  isDelete: boolean;
}
//Dropdown Details:
export interface IBasicDropDown {
  name: string;
}
export interface IDropdownDetails {
  categoryDrop: IBasicDropDown[];
}
//View and Edit Obj:
export interface IActionBooleans {
  isEdit: boolean;
  isView: boolean;
}
//RightSideBarContents Details:
export interface IRightSideBarContents {
  categoryConfigContent: string;
}
//Page Name
export interface ISideNavPageNames {
  Request: string;
  ApproveConfig: string;
  CategoryConfig: string;
}
