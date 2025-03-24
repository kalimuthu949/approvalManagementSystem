//interFace Imports:
import {
  IActionBooleans,
  IDropdownDetails,
  IEmailTemplateConfigDetails,
  ILibraryNames,
  IListNames,
  IRequestHubDetails,
  IRightSideBarContents,
  IRightSideBarContentsDetails,
  ISectionColumnsConfig,
  ISideNavPageNames,
  ITabviewDetails,
} from "./interface";

//ListNames Config:
export namespace Config {
  export const ListNames: IListNames = {
    CategoryConfig: "CategoryConfig",
    RequestsHub: "RequestsHub",
    ApprovalConfig: "ApprovalConfig",
    ApprovalStageConfig: "ApprovalStageConfig",
    CategorySectionConfig: "CategorySectionConfig",
    SectionColumnsConfig: "SectionColumnsConfig",
    ApprovalHistory: "ApprovalHistory",
    EmailTemplateConfig: "EmailTemplateConfig",
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
    EmailWorkFlowContent: "",
  };

  //RightSideBarContents Initialize Details:
  export const rightSideBarContentsDetails: IRightSideBarContentsDetails = {
    addRequestDetails: false,
    categoryConfigDetails: false,
    approvalConfigDetails: false,
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
    createdDate: "",
    author: { id: null, email: "", name: "" },
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

  //EmailTemplateContents Config
  export const EmailTemplateConfigDetails: IEmailTemplateConfigDetails = {
    id: null,
    templateName: "",
    emailBody: "",
  };
}
