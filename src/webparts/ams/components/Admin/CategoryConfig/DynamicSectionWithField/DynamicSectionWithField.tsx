//Default Imports:
import * as React from "react";
import { useState } from "react";
//PrimeReact Imports:
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { IoIosAddCircle } from "react-icons/io";
import { InputSwitch } from "primereact/inputswitch";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
//Styles Imports:
import DynamicSectionWithFieldStyles from "./DynamicSectionWithField.module.scss";
import "../../../../../../External/style.css";
import "./DynamicSectionWithField.css";
//Common Service Imports:
import { Config } from "../../../../../../CommonServices/Config";
import {
  columnTypes,
  stageBodyTemplate,
} from "../../../../../../CommonServices/CommonTemplates";
import { Label } from "office-ui-fabric-react";

const DynamicSectionWithField = ({
  setNextStageFromCategory,
  setSelectedApprover,
  setDynamicSectionWithFieldSideBarVisible,
}) => {
  const [sections, setSections] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newChoice, setNewChoice] = useState("");
  const [newField, setNewField] = useState<any>({
    sectionIndex: null,
    name: "",
    type: null,
    required: false,
    stages: [],
    choices: [],
  });
  console.log(sections, "section");

  const addDynamicSection = () => {
    setSections([...sections, { name: "", columns: [] }]);
  };

  const handleSaveField = () => {
    const updatedSections = [...sections];
    if (newField.sectionIndex !== null) {
      updatedSections[newField.sectionIndex].columns.push({
        name: newField.name,
        type: newField.type,
        required: newField.required,
        stages: newField.stages,
        choices: newField.type === "Choice" ? newField.choices : [],
      });
      setSections(updatedSections);
    }
    setNewField({
      sectionIndex: null,
      name: "",
      type: null,
      required: false,
      stages: [],
    });
    setShowPopup(false);
  };

  const RequiredBodyTemplate = (rowData) => {
    return <div>{rowData?.required ? "Yes" : "No"}</div>;
  };

  return (
    <>
      <div className={`${DynamicSectionWithFieldStyles.container} container`}>
        <Button
          icon={
            <IoIosAddCircle
              className={DynamicSectionWithFieldStyles.addSectionBtnIcon}
            />
          }
          label="Add Section"
          onClick={addDynamicSection}
          className={DynamicSectionWithFieldStyles.addButton}
        />
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={DynamicSectionWithFieldStyles.sectionContainer}
          >
            <Label className={DynamicSectionWithFieldStyles.label}>
              Section name
            </Label>
            <InputText
              value={section.name}
              onChange={(e) => {
                const updatedSections = [...sections];
                updatedSections[sectionIndex].name = e.target.value;
                setSections(updatedSections);
              }}
              placeholder="Enter here"
              className={DynamicSectionWithFieldStyles.sectionInput}
            />
            {section.columns?.length > 0 ? (
              <div className="customDataTableContainer">
                <DataTable
                  value={section.columns}
                  emptyMessage={
                    <>
                      <p style={{ textAlign: "center" }}>No Records Found</p>
                    </>
                  }
                >
                  <Column header="Name" field="name"></Column>
                  <Column header="Type" field="type"></Column>
                  <Column
                    header="Required"
                    body={RequiredBodyTemplate}
                  ></Column>
                  <Column
                    header="Approver"
                    body={(row) => stageBodyTemplate(row)}
                  ></Column>
                  <Column header="Action"></Column>
                </DataTable>
              </div>
            ) : (
              ""
            )}
            <Button
              icon={
                <IoIosAddCircle
                  className={DynamicSectionWithFieldStyles.addSectionBtnIcon}
                />
              }
              label="Add Field"
              onClick={() => {
                setNewField({ ...newField, sectionIndex });
                setShowPopup(true);
              }}
              className={DynamicSectionWithFieldStyles.addFieldButton}
            />
            {/* {section.columns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className={DynamicSectionWithFieldStyles.columnContainer}
              >
                <p>
                  {column.name} ({column.type}) {column.required ? "*" : ""}
                </p>
              </div>
            ))} */}
          </div>
        ))}

        <Dialog
          visible={showPopup}
          onHide={() => setShowPopup(false)}
          header="Create Field"
          className={DynamicSectionWithFieldStyles.dialog}
        >
          <div>
            <div className={DynamicSectionWithFieldStyles.columnNameContainer}>
              <Label className={DynamicSectionWithFieldStyles.label}>
                Name
              </Label>
              <InputText
                value={newField.name}
                onChange={(e) =>
                  setNewField({ ...newField, name: e.target.value })
                }
                placeholder="Enter name"
                className={DynamicSectionWithFieldStyles.columnNameInput}
              />
            </div>
            <div className={DynamicSectionWithFieldStyles.columnNameContainer}>
              <Label className={DynamicSectionWithFieldStyles.label}>
                Type
              </Label>
              <Dropdown
                value={newField.type}
                options={columnTypes}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    type: e.value,
                    choices: e.value === "Choice" ? [] : newField.choices,
                  })
                }
                optionLabel="name"
                placeholder="Select Type"
                style={{ padding: "4px" }}
                className={DynamicSectionWithFieldStyles.columnNameInput}
              />
            </div>
            <div className={DynamicSectionWithFieldStyles.columnNameContainer}>
              {newField.type === "Choice" && (
                <div className={DynamicSectionWithFieldStyles.choiceContainer}>
                  <InputText
                    value={newChoice}
                    onChange={(e) => setNewChoice(e.target.value)}
                    placeholder="Enter new choice"
                    className={DynamicSectionWithFieldStyles.choiceInput}
                  />
                  <Button
                    label="Add Choice"
                    icon="pi pi-plus"
                    onClick={() => {
                      if (newChoice.trim() !== "") {
                        setNewField({
                          ...newField,
                          choices: [...newField.choices, newChoice],
                        });
                        setNewChoice("");
                      }
                    }}
                    className="customSubmitButton"
                  />
                </div>
              )}
            </div>

            {/* {newField.type === "Choice" && newField.choices.length > 0 && (
              <Dropdown
                value={newField.stages}
                options={newField.choices.map((choice) => ({
                  name: choice,
                  value: choice,
                }))}
                onChange={(e) => setNewField({ ...newField, stages: e.value })}
                optionLabel="name"
                placeholder="Select Choices"
                multiple
              />
            )} */}
            <div className={DynamicSectionWithFieldStyles.columnNameContainer}>
              <Label className={DynamicSectionWithFieldStyles.label}>
                Require that this column contains information
              </Label>
              <InputSwitch
                checked={newField.required}
                onChange={(e) =>
                  setNewField({ ...newField, required: e.value })
                }
                className="InputSwitch"
              />
            </div>
            <div className={DynamicSectionWithFieldStyles.columnNameContainer}>
              <Label className={DynamicSectionWithFieldStyles.label}>
                Need to show on
              </Label>
              {["Stage 1", "Stage 2", "Stage 3", "Stage 4"].map((stage) => (
                <div
                  className={`${DynamicSectionWithFieldStyles.stageContainer} stageContainer`}
                  key={stage}
                >
                  <Checkbox
                    inputId={stage}
                    checked={newField.stages.includes(stage)}
                    onChange={(e) => {
                      const selectedStages = e.checked
                        ? [...newField.stages, stage]
                        : newField.stages.filter((s) => s !== stage);
                      setNewField({ ...newField, stages: selectedStages });
                    }}
                  />
                  <label>{stage}</label>
                </div>
              ))}
            </div>
            <div className={DynamicSectionWithFieldStyles.dialogButtons}>
              <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={() => setShowPopup(false)}
                className="customCancelButton"
              />
              <Button
                label="Save"
                icon="pi pi-save"
                onClick={handleSaveField}
                autoFocus
                className="customSubmitButton"
              />
            </div>
          </div>
        </Dialog>
      </div>
      <div className={DynamicSectionWithFieldStyles.FlowButtonsContainer}>
        <div className={DynamicSectionWithFieldStyles.FlowPreviousButton}>
          <Button
            icon="pi pi-angle-double-left"
            label="Previous"
            className="customSubmitButton"
            onClick={() => {
              setNextStageFromCategory({
                ...Config.NextStageFromCategorySideBar,
              });
            }}
          />
        </div>
        <div className={`${DynamicSectionWithFieldStyles.FlowSideBarButtons}`}>
          <Button
            icon="pi pi-times"
            label="Cancel"
            className="customCancelButton"
            onClick={() => {
              setDynamicSectionWithFieldSideBarVisible(false);
              setSelectedApprover("");
              setNextStageFromCategory({
                ...Config.NextStageFromCategorySideBar,
              });
            }}
          />

          <Button
            icon="pi pi-angle-double-right"
            label="Next"
            className="customSubmitButton"
          />
        </div>
      </div>
    </>
  );
};

export default DynamicSectionWithField;
