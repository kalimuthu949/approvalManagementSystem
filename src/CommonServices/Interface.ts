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
}

//Dropdown Details:
export interface IBasicDropDown {
  name : string
}
export interface IDropdownDetails {
  categoryDrop : IBasicDropDown[];

export interface ICategoryObjDetails {
  Category: string;

}
