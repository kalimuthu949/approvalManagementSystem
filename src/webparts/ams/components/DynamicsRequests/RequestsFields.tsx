//Default Imports:
import * as React from "react";
import { useState, useEffect } from "react";
//CommonService Imports:
import SPServices from "../../../../CommonServices/SPServices";
import { Config } from "../../../../CommonServices/Config";
import {
  IPeoplePickerDetails,
  IRightSideBarContents,
  ISectionColumnsConfig,
  IApprovalDetails,
  IApprovalStages,
} from "../../../../CommonServices/interface";
//primeReact Imports:
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Label } from "office-ui-fabric-react";
import { classNames } from "primereact/utils";
//Styles Imports:
import dynamicFieldsStyles from "./RequestsFields.module.scss";
import "../../../../External/style.css";
import WorkflowActionButtons from "../WorkflowButtons/WorkflowActionButtons";

const RequestsFields = ({
  context,
  requestsDetails,
  setRequestsDetails,
  currentRecord,
  sideBarVisible,
  recordAction,
  navigateFrom,
  setRequestsDashBoardContent,
  setDynamicRequestsSideBarVisible,
}) => {
  const [dynamicFields, setDynamicFields] = useState<ISectionColumnsConfig[]>(
    []
  );
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [author, setAuthor] = useState<IPeoplePickerDetails>();
  const loginUser = context._pageContext._user.email;
  const [approvalDetails, setApprovalDetails] = useState<IApprovalDetails>({
    parentID: currentRecord.id,
    stage: currentRecord.approvalJson[0].Currentstage,
    approverEmail: loginUser,
    status: "",
    comments: "",
  });

  //CategorySectionConfig List
  const getCategorySectionConfigDetails = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames?.CategorySectionConfig,
      Select: "*,Category/Id",
      Expand: "Category",
      Orderby: "Modified",
      Orderbydecorasc: false,
      Filter: [
        {
          FilterKey: "Category",
          Operator: "eq",
          FilterValue: currentRecord.CategoryId.toString(),
        },
      ],
    })
      .then((res: any) => {
        res.forEach((item: any) => {
          getSectionColumnsConfigDetails(item?.SectionName, item?.ID);
        });
      })
      .catch((err) => {
        console.log(err, "getCategorySectionConfigDetails");
      });
  };
  //SectionColumnsConfig List
  const getSectionColumnsConfigDetails = (
    secionName: string,
    secionID: number
  ) => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.SectionColumnsConfig,
      Select: "*,ParentSection/Id",
      Expand: "ParentSection",
      Orderby: "Modified",
      Orderbydecorasc: false,
      Filter: [
        {
          FilterKey: "ParentSection",
          Operator: "eq",
          FilterValue: secionID.toString(),
        },
        {
          FilterKey: "IsDelete",
          Operator: "eq",
          FilterValue: "false",
        },
      ],
    })
      .then((res) => {
        const tempArr: ISectionColumnsConfig[] = [];
        res.forEach((item: any) => {
          tempArr.push({
            id: item?.ID,
            sectionName: secionName,
            columnName: item?.ColumnInternalName,
            columnType: item?.ColumnType,
            isRequired: item?.IsRequired,
            viewStage: JSON.parse(item?.ViewStage),
          });
          setDynamicFields([...tempArr]);
        });
      })
      .catch((e) => {
        console.log(e, "getSectionColumnsConfig err");
      });
  };

  //Get RequestHub details
  const getRequestHubDetails = () => {
    SPServices.SPReadItemUsingId({
      Listname: Config.ListNames.RequestsHub,
      Select: "*,Author/ID,Author/Title,Author/EMail",
      Expand: "Author",
      SelectedId: currentRecord.id,
    })
      .then((item: any) => {
        const tempArr = {};
        dynamicFields.map((e) => (tempArr[e.columnName] = item[e.columnName]));
        setFormData(tempArr);
        setAuthor({
          id: item.Author.ID,
          name: item.Author.Title,
          email: item.Author.EMail,
        });
      })
      .catch((e) => {
        console.log("Get Current Record from RequestHup Details error", e);
      });
  };

  //Get Approval History
  const getApprovalHistory = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.ApprovalHistory,
      Select: "*,ParentID/Id,Approver/Title,Approver/EMail,Approver/Id",
      Expand: "ParentID,Approver",
      Filter: [
        {
          FilterKey: "ParentIDId",
          Operator: "eq",
          FilterValue: currentRecord.id.toString(),
        },
      ],
    })
      .then((res) => {
        console.log("res", res);
      })
      .catch((e) => console.log("getApprovalHistory errror", e));
  };

  //Set Approval Details
  const getApprovalDetails = async (columnName, value) => {
    debugger;
    let data = { ...approvalDetails };
    data[`${columnName}`] = value;
    await setApprovalDetails({ ...data });
  };
  //handleInputChange
  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    dynamicFields.forEach((field) => {
      if (field.isRequired && !formData[field.columnName]?.trim()) {
        newErrors[field.columnName] = `${field.columnName} is required.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //Show columns based on view stage
  const showColumnsByStage = (field) => {
    if (
      (navigateFrom === "MyApproval" &&
        currentRecord?.approvalJson[0]?.stages
          .filter((stage) => field?.viewStage[0]?.Stage.includes(stage.stage))
          .some((stage) =>
            stage.approvers.some((e) => e.email === loginUser)
          )) ||
      navigateFrom === "MyRequest" ||
      navigateFrom === "AllRequest"
    ) {
      return true;
    } else {
      return false;
    }
  };

  //DynamicRequestFieldsSideBarContent Return Function:
  const DynamicRequestsFieldsSideBarContent = () => {
    return (
      <>
        <div className={dynamicFieldsStyles.formContainer}>
          <Label className={dynamicFieldsStyles.labelHeader}>
            Request details
          </Label>
          <div className={dynamicFieldsStyles.singlelineFields}>
            {dynamicFields
              .filter((f) => f.columnType === "Singleline")
              .map(
                (field) =>
                  showColumnsByStage(field) && (
                    <div
                      key={field.id}
                      className={dynamicFieldsStyles.inputField}
                    >
                      <Label className={dynamicFieldsStyles.label}>
                        {field.columnName}
                        {field?.isRequired && (
                          <span className="required">*</span>
                        )}
                      </Label>
                      <InputText
                        readOnly={
                          !(
                            recordAction === "Edit" &&
                            author?.email === loginUser &&
                            navigateFrom === "MyRequest"
                          )
                        }
                        id={field.columnName}
                        value={formData[field.columnName] || ""}
                        onChange={(e) =>
                          handleInputChange(field.columnName, e.target.value)
                        }
                      />
                      {errors[field.columnName] && (
                        <span className={dynamicFieldsStyles.errorMsg}>
                          {errors[field.columnName]}
                        </span>
                      )}
                    </div>
                  )
              )}
          </div>
          <div className={dynamicFieldsStyles.multilineFields}>
            {dynamicFields
              .filter((f) => f.columnType === "Multiline")
              .map(
                (field) =>
                  showColumnsByStage(field) && (
                    <div
                      key={field.id}
                      className={dynamicFieldsStyles.inputField}
                    >
                      <Label className={dynamicFieldsStyles.label}>
                        {field.columnName}{" "}
                        {field?.isRequired && (
                          <span className="required">*</span>
                        )}
                      </Label>
                      <InputTextarea
                        id={field.columnName}
                        autoResize
                        readOnly={
                          !(
                            recordAction === "Edit" &&
                            author?.email === loginUser &&
                            navigateFrom === "MyRequest"
                          )
                        }
                        value={formData[field.columnName] || ""}
                        onChange={(e) =>
                          handleInputChange(field.columnName, e.target.value)
                        }
                        rows={3}
                      />
                      {errors[field.columnName] && (
                        <span className={dynamicFieldsStyles.errorMsg}>
                          {errors[field.columnName]}
                        </span>
                      )}
                    </div>
                  )
              )}
          </div>
          {recordAction === "Edit" && navigateFrom === "MyApproval" && (
            <div className={dynamicFieldsStyles.approverSection}>
              <Label className={dynamicFieldsStyles.labelHeader}>
                Approvers section
              </Label>
              <Label className={dynamicFieldsStyles.label}>
                Approver Description
              </Label>
              <InputTextarea
                autoResize
                style={{ width: "100%" }}
                value={approvalDetails?.comments}
                onChange={(e) => {
                  getApprovalDetails("comments", e.target?.value || "");
                }}
                rows={3}
              />
            </div>
          )}
          <div className={`${dynamicFieldsStyles.sideBarButtonContainer}`}>
            {recordAction === "Edit" && (
              <>
                <WorkflowActionButtons
                  validateForm={validateForm}
                  approvalDetails={approvalDetails}
                  setApprovalDetails={setApprovalDetails}
                  setRequestsSideBarVisible={setDynamicRequestsSideBarVisible}
                  context={context}
                  updatedRecord={formData}
                  requestsHubDetails={requestsDetails}
                  setRequestsHubDetails={setRequestsDetails}
                  itemID={currentRecord.id}
                />
              </>
            )}
            {recordAction === "View" && (
              <>
                <Button
                  icon="pi pi-times"
                  label="Close"
                  className="customCancelButton"
                  onClick={() => handleCancel()}
                />
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  const handleCancel = () => {
    setDynamicRequestsSideBarVisible(false);
    setErrors({});
    setFormData({});
  };

  useEffect(() => {
    setDynamicFields([]);
    setFormData({});
    setErrors({});
    getApprovalHistory();
    if (currentRecord.CategoryId) {
      getCategorySectionConfigDetails();
    }
  }, [null, currentRecord.CategoryId]);

  useEffect(() => {
    setRequestsDashBoardContent((prev: IRightSideBarContents) => ({
      ...prev,
      RequestsDashBoardContent: DynamicRequestsFieldsSideBarContent(),
    }));
  }, [dynamicFields, formData, errors, approvalDetails]);

  useEffect(() => {
    getRequestHubDetails();
    setApprovalDetails({
      parentID: currentRecord.id,
      stage: currentRecord.approvalJson[0].Currentstage,
      approverEmail: loginUser,
      status: "",
      comments: "",
    });
  }, [dynamicFields, sideBarVisible]);

  return <></>;
};

export default RequestsFields;
