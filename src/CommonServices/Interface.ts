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
  RequestsHub: string;
  ApprovalConfig: string;
  ApprovalStageConfig: string;
  CategorySectionConfig: string;
  SectionColumnsConfig: string;
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
  RequestsDashBoardContent: string;
}
//Page Name
export interface ISideNavPageNames {
  Request: string;
  ApproveConfig: string;
  CategoryConfig: string;
}

//User Details
export interface IUserDetails {
  name: string;
  email: string;
}

//Toast Message Details:
export interface IToaster {
  iconName: string;
  ClsName: string;
  type: "Warning" | "Success" | "Alert";
  msg: string;
}

//RequestHub Details:
export interface IRequestHubDetails {
  id: number;
  requestId: string;
  status: string;
  category: string;
  CategoryId: number;
  approvers: IPeoplePickerDetails[];
  approvalJson: IApprovalFlow[];
}

export interface IApprovalFlow {
  ApprovalFlowName: string;
  Currentstage: number;
  TotalStages: number;
  RejectionFlow: number;
  ApprovalType: number;
  stages: Stage[];
}
interface Stage {
  stage: number;
  stageStatusCode: number;
  approvers: Approver[];
}
interface Approver {
  id: string;
  name: string;
  email: string;
  statusCode: number;
}
//LibraryNames Details:
export interface ILibraryNames {
  AttachmentsLibrary: string;
}

//SectionColumnsConfiguration Details:
export interface ISectionColumnsConfig {
  id: number;
  sectionName: string;
  columnName: string;
  columnType: string;
  isRequired: boolean;
}
