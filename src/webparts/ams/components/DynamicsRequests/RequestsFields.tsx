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
        console.log(e, "getSectionColumnsConfig");
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

  //Set Approval Details
  const getApprovalDetails = async (columnName, value) => {
    let data = { ...approvalDetails };
    data[`${columnName}`] = value;
    // approvalDetails[columnName] = value;
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

  const handleSubmit = () => {
    if (validateForm()) {
      // Call update function here
    }
  };

  //DynamicRequestFieldsSideBarContent Return Function:
  const DynamicRequestsFieldsSideBarContent = () => {
    return (
      <>
        <div className={dynamicFieldsStyles.formContainer}>
          <div className={dynamicFieldsStyles.singlelineFields}>
            {dynamicFields
              .filter((f) => f.columnType === "Singleline")
              .map((field) => (
                <div key={field.id} className={dynamicFieldsStyles.inputField}>
                  <Label className={dynamicFieldsStyles.label}>
                    {field.columnName}
                    {field?.isRequired && <span className="required">*</span>}
                  </Label>
                  <InputText
                    readOnly={
                      !(recordAction === "Edit" && author?.email === loginUser)
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
              ))}
          </div>
          <div className={dynamicFieldsStyles.multilineFields}>
            {dynamicFields
              .filter((f) => f.columnType === "Multiline")
              .map((field) => (
                <div key={field.id} className={dynamicFieldsStyles.inputField}>
                  <Label className={dynamicFieldsStyles.label}>
                    {field.columnName}{" "}
                    {field?.isRequired && <span className="required">*</span>}
                  </Label>
                  <InputTextarea
                    id={field.columnName}
                    autoResize
                    readOnly={
                      !(recordAction === "Edit" && author?.email === loginUser)
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
              ))}
          </div>
          {recordAction === "Edit" && author?.email !== loginUser && (
            <>
              <Label className={dynamicFieldsStyles.label}>
                Approver Description
              </Label>
              <InputTextarea
                autoResize
                value={approvalDetails?.comments}
                onChange={(e) => {
                  getApprovalDetails("comments", e.target?.value || "");
                }}
                rows={3}
              />
            </>
          )}
          <div className={`${dynamicFieldsStyles.sideBarButtonContainer}`}>
            {recordAction === "Edit" && (
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
              // <>
              //   <Button
              //     icon="pi pi-times"
              //     label="Cancel"
              //     className="customCancelButton"
              //     onClick={() => handleCancel()}
              //   />
              //   <Button
              //     icon="pi pi-save"
              //     label="Submit"
              //     className="customSubmitButton"
              //     onClick={() => {
              //       handleSubmit();
              //     }}
              //   />
              // </>
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
  }, [dynamicFields, sideBarVisible]);


  return <></>;
};

export default RequestsFields;
