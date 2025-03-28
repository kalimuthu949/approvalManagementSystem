//Default Imports:
import * as React from "react";
import { useState, useEffect } from "react";
//PrimeReact Imports:
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
//Styles Imports:
import EmailContainerStyles from "./EmailContainer.module.scss";
//Commmon Service Imports:
import { INextStageFromCategorySideBar } from "../../../../../../CommonServices/interface";
import { Config } from "../../../../../../CommonServices/Config";
import ExistingEmail from "./EmailChildTemplates/ExistingEmail";
import CustomEmail from "./EmailChildTemplates/CustomEmail";
import SPServices from "../../../../../../CommonServices/SPServices";
import { sp } from "@pnp/sp";

const EmailContainer = ({
  setFinalSubmit,
  setNextStageFromCategory,
  setSelectedApprover,
  setCategoryInputs,
  setEmailContainerFieldSideBarVisible,
  finalSubmit,
  getCategoryConfigDetails,
}) => {
  console.log(finalSubmit, "FinalSubmit");
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  // const [newCategoryId, setNewCategoryId] = useState<number>(null);
  // Load sessionStorage data on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("selectedEmail");
    if (storedEmail) {
      setSelectedEmail(storedEmail);
    }
  }, []);

  // Store selectedEmail in sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("selectedEmail", selectedEmail);
  }, [selectedEmail]);

  //Add Datas to Sharepoint List:
  const finalHandleSubmit = async () => {
    try {
      if (
        finalSubmit?.categoryConfig?.category !== "" &&
        finalSubmit?.categoryConfig?.ExistingApprover !== null
      ) {
        const res = await SPServices.SPAddItem({
          Listname: Config.ListNames.CategoryConfig,
          RequestJSON: {
            Category: finalSubmit?.categoryConfig?.category,
          },
        });

        if (res?.data?.ID) {
          const newCategoryId = res?.data?.ID; // Use a variable instead of state
          const existingApprovalConfig: any = await SPServices.SPReadItems({
            Listname: Config.ListNames.ApprovalConfig,
            Select: "ID,CategoryId",
            Filter: [
              {
                FilterKey: "ID",
                Operator: "eq",
                FilterValue:
                  finalSubmit?.categoryConfig?.ExistingApprover.toString(),
              },
            ],
          });

          let existingCategories = existingApprovalConfig[0]?.CategoryId || [];
          existingCategories.push(newCategoryId);

          await SPServices.SPUpdateItem({
            Listname: Config.ListNames.ApprovalConfig,
            ID: finalSubmit?.categoryConfig?.ExistingApprover,
            RequestJSON: {
              CategoryId: { results: existingCategories },
            },
          });

          if (finalSubmit?.dynamicSectionWithField?.length > 0) {
            const list = sp.web.lists.getByTitle("RequestsHub");
            for (const section of finalSubmit.dynamicSectionWithField) {
              for (const column of section.columns) {
                let fieldTypeKind;
                const columnTypeMap = {
                  text: 2,
                  textarea: 3,
                  Choice: 6,
                };

                fieldTypeKind = columnTypeMap[column.type];
                if (!fieldTypeKind) {
                  console.log("Invalid column type:", column.type);
                  continue;
                }

                await addColumnToList(
                  list,
                  fieldTypeKind,
                  column.name,
                  column.choices || []
                );
              }

              const CategorySecionConfigRes = await SPServices.SPAddItem({
                Listname: Config.ListNames?.CategorySectionConfig,
                RequestJSON: {
                  CategoryId: newCategoryId,
                  SectionName: section.name,
                },
              });
              if (CategorySecionConfigRes?.data?.ID) {
              }
              console.log(CategorySecionConfigRes, "CategorySecionConfigRes");
            }
          }
        }
      }

      alert("Process completed successfully!");
      sessionStorage.clear();
      setNextStageFromCategory({ ...Config.NextStageFromCategorySideBar });
      setEmailContainerFieldSideBarVisible(false);
      setSelectedApprover("");
      setCategoryInputs("");
      setFinalSubmit({ ...Config.finalSubmitDetails });
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      alert("An error occurred while processing the request.");
    }
  };

  //Add to Column in Our SharepointList
  const addColumnToList = async (list, fieldTypeKind, columnName, choices) => {
    try {
      if (fieldTypeKind === 2) {
        await list.fields.addText(columnName); // For Single Line Text
      } else if (fieldTypeKind === 3) {
        await list.fields.addMultilineText(columnName); // For Multiple Lines of Text
      } else if (fieldTypeKind === 6) {
        await list.fields.addChoice(columnName, choices); // Pass choices array directly
      }
    } catch (error) {
      console.error(`Error adding column ${columnName}:`, error);
    }
  };

  return (
    <>
      <div className={EmailContainerStyles.heading}>Email template</div>
      <div className={`${EmailContainerStyles.radioContainer}`}>
        <div className={`${EmailContainerStyles.radioDiv}`}>
          <RadioButton
            inputId="existing"
            name="email"
            value="existing"
            onChange={(e) => {
              setSelectedEmail(e?.value);
            }}
            checked={selectedEmail === "existing"}
          />
          <label
            className={`${EmailContainerStyles.radioDivLabel}`}
            htmlFor="existing"
          >
            Existing template
          </label>
        </div>
        <div className={`${EmailContainerStyles.radioDiv}`}>
          <RadioButton
            inputId="custom"
            name="email"
            value="custom"
            onChange={(e) => setSelectedEmail(e?.value)}
            checked={selectedEmail === "custom"}
          />
          <label className={`${EmailContainerStyles.radioDivLabel}`}>
            Custom template
          </label>
        </div>
      </div>
      <div>
        {selectedEmail == "existing" ? (
          <ExistingEmail />
        ) : selectedEmail == "custom" ? (
          <CustomEmail
            setCustomEmailTemplateSideBarVisible={
              setEmailContainerFieldSideBarVisible
            }
          />
        ) : (
          ""
        )}
      </div>
      <div className={EmailContainerStyles.FlowButtonsContainer}>
        <div className={EmailContainerStyles.FlowPreviousButton}>
          <Button
            icon="pi pi-angle-double-left"
            label="Previous"
            className="customSubmitButton"
            onClick={() => {
              setNextStageFromCategory(
                (prev: INextStageFromCategorySideBar) => ({
                  ...prev,
                  EmailTemplateSection: false,
                  dynamicSectionWithField: true,
                })
              );
            }}
          />
        </div>
        <div className={`${EmailContainerStyles.FlowSideBarButtons}`}>
          <Button
            icon="pi pi-times"
            label="Cancel"
            className="customCancelButton"
            onClick={() => {
              setEmailContainerFieldSideBarVisible(false);
              setSelectedApprover("");
              setNextStageFromCategory({
                ...Config.NextStageFromCategorySideBar,
              });
              sessionStorage.clear();
            }}
          />

          <Button
            icon="pi pi-save"
            label="Submit"
            onClick={() => {
              finalHandleSubmit();
            }}
            className="customSubmitButton"
          />
        </div>
      </div>
    </>
  );
};

export default EmailContainer;
