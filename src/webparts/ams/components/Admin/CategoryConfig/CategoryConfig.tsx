//Default Imports:
import * as React from "react";
import { useState, useEffect, useRef } from "react";
//Common Service Imports:
import SPServices from "../../../../../CommonServices/SPServices";
import { Config } from "../../../../../CommonServices/Config";
import {
  IActionBooleans,
  ICategoryDetails,
  IFinalSubmitDetails,
  INextStageFromCategorySideBar,
  IRightSideBarContents,
} from "../../../../../CommonServices/interface";
import { ActionsMenu } from "../../../../../CommonServices/CommonTemplates";
//Styles Imports:
import "../../../../../External/style.css";
import categoryConfigStyles from "./CategoryConfig.module.scss";
//primeReact Imports:
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { RadioButton } from "primereact/radiobutton";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Label } from "office-ui-fabric-react";
import ExistingApprover from "./ExistingApprover";
import CustomApprover from "./CustomApprover";
import { Button } from "primereact/button";
//Component Imports:
import DynamicSectionWithField from "./DynamicSectionWithField/DynamicSectionWithField";
import EmailContainer from "./EmailTemplate/EmailContainer";

const CategoryConfig = ({
  setCategorySideBarContent,
  setCategorySideBarVisible,
}) => {
  //state variables:
  const toast = useRef<Toast>(null);
  const [categoryDetails, setCategoryDetails] = useState<ICategoryDetails[]>(
    []
  );
  const [categoryInputs, setCategoryInputs] = useState<string>("");
  const [actionsBooleans, setActionsBooleans] = useState<IActionBooleans>({
    ...Config.InitialActionsBooleans,
  });
  const [selectedApprover, setSelectedApprover] = useState<string>("");
  const [nextStageFromCategory, setNextStageFromCategory] =
    useState<INextStageFromCategorySideBar>({
      ...Config.NextStageFromCategorySideBar,
    });
  const [finalSubmit, setFinalSubmit] = useState<IFinalSubmitDetails>({
    ...Config.finalSubmitDetails,
  });

  //Get Category Config Details:
  const getCategoryConfigDetails = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryConfig,
      Orderby: "Modified",
      Orderbydecorasc: false,
      Select: "*",
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "eq",
          FilterValue: "false",
        },
      ],
    })
      .then((res: any) => {
        const tempCategoryArray: ICategoryDetails[] = [];
        res.forEach((items: any) => {
          tempCategoryArray.push({
            id: items?.ID,
            category: items?.Category,
            isDelete: items?.IsDelete,
          });
        });
        setCategoryDetails([...tempCategoryArray]);
      })
      .catch((err) => {
        console.log("Get Category Config Error", err);
      });
  };

  //Set Actions PopUp:
  const actionsWithIcons = (rowData: ICategoryDetails) => [
    {
      label: "View",
      icon: "pi pi-eye",
      command: () => {},
    },
    {
      label: "Edit",
      icon: "pi pi-pencil ",
      command: () => {},
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => {},
    },
  ];

  //Render Action Column:
  const renderActionColumn = (rowData: ICategoryDetails) => {
    const menuModel = actionsWithIcons(rowData);
    return <ActionsMenu items={menuModel} />;
  };

  //CategoryRightSideBar Contents:
  const categoryConfigSideBarContents = () => {
    return (
      <>
        <div>
          {nextStageFromCategory.dynamicSectionWithField ||
          nextStageFromCategory.EmailTemplateSection ? (
            <></>
          ) : (
            <>
              <div className={`${categoryConfigStyles.inputContainer}`}>
                <div style={{ paddingBottom: "10px" }}>
                  <Label className={`${categoryConfigStyles.label}`}>
                    Category
                  </Label>
                </div>
                <InputText
                  className={`${categoryConfigStyles.input}`}
                  value={categoryInputs}
                  placeholder="Enter Category"
                  onChange={(e) => setCategoryInputs(e.target.value)}
                />
              </div>

              <div className={`${categoryConfigStyles.radioContainer}`}>
                <div className={`${categoryConfigStyles.radioDiv}`}>
                  <RadioButton
                    inputId="existing"
                    name="approver"
                    value="existing"
                    onChange={(e) => {
                      setSelectedApprover(e?.value);
                    }}
                    checked={selectedApprover === "existing"}
                  />
                  <label
                    className={`${categoryConfigStyles.radioDivLabel}`}
                    htmlFor="existing"
                  >
                    Existing approver
                  </label>
                </div>
                <div className={`${categoryConfigStyles.radioDiv}`}>
                  <RadioButton
                    inputId="custom"
                    name="approver"
                    value="custom"
                    onChange={(e) => setSelectedApprover(e?.value)}
                    checked={selectedApprover === "custom"}
                  />
                  <label
                    className={`${categoryConfigStyles.radioDivLabel}`}
                    htmlFor="custom"
                  >
                    Custom approver
                  </label>
                </div>
              </div>
            </>
          )}
          <div>
            {selectedApprover === "existing" &&
            nextStageFromCategory.ApproverSection ? (
              <ExistingApprover
                setFinalSubmit={setFinalSubmit}
                setExisitingApproverSideBarVisible={setCategorySideBarVisible}
                category={categoryInputs}
              />
            ) : selectedApprover === "custom" &&
              nextStageFromCategory.ApproverSection ? (
              <CustomApprover />
            ) : (
              <></>
            )}
            {nextStageFromCategory.dynamicSectionWithField ? (
              <DynamicSectionWithField
                setFinalSubmit={setFinalSubmit}
                setNextStageFromCategory={setNextStageFromCategory}
                setSelectedApprover={setSelectedApprover}
                setDynamicSectionWithFieldSideBarVisible={
                  setCategorySideBarVisible
                }
              />
            ) : nextStageFromCategory.EmailTemplateSection ? (
              <EmailContainer
                setFinalSubmit={setFinalSubmit}
                getCategoryConfigDetails={getCategoryConfigDetails}
                finalSubmit={finalSubmit}
                setNextStageFromCategory={setNextStageFromCategory}
                setSelectedApprover={setSelectedApprover}
                setCategoryInputs={setCategoryInputs}
                setEmailContainerFieldSideBarVisible={setCategorySideBarVisible}
              />
            ) : (
              <></>
            )}
          </div>
          {nextStageFromCategory.ApproverSection ? (
            <div className={`${categoryConfigStyles.FlowSideBarButtons}`}>
              <Button
                icon="pi pi-times"
                label="Cancel"
                onClick={() => {
                  sessionStorage.clear();
                  setCategorySideBarVisible(false);
                  setSelectedApprover("");
                  setNextStageFromCategory({
                    ...Config.NextStageFromCategorySideBar,
                  });
                  setCategoryInputs("");
                }}
                className="customCancelButton"
              />

              <Button
                icon="pi pi-angle-double-right"
                label="Next"
                className="customSubmitButton"
                onClick={() => {
                  setNextStageFromCategory(
                    (prev: INextStageFromCategorySideBar) => ({
                      ...prev,
                      dynamicSectionWithField: true,
                      ApproverSection: false,
                    })
                  );
                }}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </>
    );
  };

  useEffect(() => {
    getCategoryConfigDetails();
  }, []);

  useEffect(() => {
    setCategorySideBarContent((prev: IRightSideBarContents) => ({
      ...prev,
      categoryConfigContent: categoryConfigSideBarContents(),
    }));
  }, [categoryInputs, selectedApprover, nextStageFromCategory]);

  return (
    <>
      <Toast ref={toast} />
      <div className="customDataTableContainer">
        <DataTable
          value={categoryDetails}
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage={
            <>
              <p style={{ textAlign: "center" }}>No Records Found</p>
            </>
          }
        >
          <Column
            style={{ width: "80%" }}
            field="category"
            header="Category"
          ></Column>
          <Column
            style={{ width: "20%" }}
            field="Action"
            body={renderActionColumn}
          ></Column>
        </DataTable>
      </div>
    </>
  );
};

export default CategoryConfig;
