//interFace Imports:
import {
  IActionBooleans,
  IDropdownDetails,
  ILibraryNames,
  IListNames,
  IRequestHubDetails,
  IRightSideBarContents,
  ISectionColumnsConfig,
  ISideNavPageNames,
  ITabviewDetails,
} from "./interface";

export namespace Config {
  //ListNames Config:
  export const ListNames: IListNames = {
    CategoryConfig: "CategoryConfig",
    RequestsHub: "RequestsHub",
    ApprovalConfig: "ApprovalConfig",
    ApprovalStageConfig: "ApprovalStageConfig",
    CategorySectionConfig: "CategorySectionConfig",
    SectionColumnsConfig: "SectionColumnsConfig",
    ApprovalHistory: "ApprovalHistory",
  };

  //Dropdown Config:
  export const initialConfigDrop: IDropdownDetails = {
    categoryDrop: [],
    approvelProcess: [],
  };

  //View and Edit Obj:
  export const InitialActionsBooleans: IActionBooleans = {
    isEdit: false,
    isView: false,
  };

  //RightSideBarContents Config:
  export const rightSideBarContents: IRightSideBarContents = {
    categoryConfigContent: "",
    ApprovalConfigContent: "",
    RequestsDashBoardContent: "",
    AddRequestsDashBoardContent: "",
  };

  //PageNames Config:
  export const sideNavPageNames: ISideNavPageNames = {
    Request: "Request",
    ApproveConfig: "ApproveConfig",
    CategoryConfig: "CategoryConfig",
  };

  //RequestHub Config:
  export const RequestHubDetails: IRequestHubDetails = {
    id: null,
    requestId: "",
    status: "",
    category: "",
    CategoryId: null,

    approvalJson: [],
  };

  //LibraryNames Config:
  export const LibraryNames: ILibraryNames = {
    AttachmentsLibrary: "AttachmentsLibrary",
  };

  //SecionColumnsConfiguration Details:
  export const SectionColumnsConfigDetails: ISectionColumnsConfig = {
    id: null,
    sectionName: "",
    columnName: "",
    columnType: "",
    isRequired: false,
    viewStage: [],
  };

  //TabViewContent Config
  export const TabViewConfigDetails: ITabviewDetails = {
    id: null,
    name: "",
  };
}
