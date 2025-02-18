//interFace Imports:

import { IDropdownDetails, ICategoryObjDetails, IListNames } from "./interface";

export namespace Config {
  //ListNames Config:
  export const ListNames: IListNames = {
    CategoryConfig: "CategoryConfig",
  };

  //Dropdown Config:
  export const initialConfigDrop: IDropdownDetails = {
    categoryDrop: [],
  };
  export const InitialCategoryConfigDetails: ICategoryObjDetails = {
    Category: "",
  };
}
