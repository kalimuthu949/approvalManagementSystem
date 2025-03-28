import * as React from "react";
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import customEmailStyles from "./CustomEmail.module.scss";
import { Label } from "office-ui-fabric-react";
import { Config } from "../../../../../../../CommonServices/Config";
import SPServices from "../../../../../../../CommonServices/SPServices";

const statusOptions = [
  { label: "Approved", value: "Approved" },
  { label: "Reject", value: "Reject" },
  { label: "Resubmit", value: "Resubmit" },
  { label: "Rework", value: "Rework" },
];

const CustomEmail = ({ setCustomEmailTemplateSideBarVisible }) => {
  const [templates, setTemplates] = useState([
    { templateName: "", emailBody: "", status: null },
  ]);

  const handleChange = (index, key, value) => {
    const newTemplates = [...templates];
    newTemplates[index][key] = value;
    setTemplates(newTemplates);
  };

  const handleAdd = () => {
    setTemplates([
      ...templates,
      { templateName: "", emailBody: "", status: null },
    ]);
  };

  const handleSubmit = () => {
    templates.forEach((template) => {
      if (template.templateName && template.emailBody) {
        SPServices.SPAddItem({
          Listname: Config.ListNames?.EmailTemplateConfig,
          RequestJSON: template,
        }).catch((err) => console.log("Error in Creating Email Template", err));
      }
    });
    setTemplates([{ templateName: "", emailBody: "", status: null }]);
  };

  return (
    <div>
      {templates.map((template, index) => (
        <div key={index} className={customEmailStyles.templateContainer}>
          <div className={customEmailStyles.fieldsContainer}>
            <div className={customEmailStyles.fieldsContainerChild}>
              <Label className={customEmailStyles.label}>Template Name</Label>
              <InputText
                value={template.templateName}
                onChange={(e) =>
                  handleChange(index, "templateName", e.target.value)
                }
                style={{ width: "38%" }}
                className={customEmailStyles.input}
              />
            </div>
            <div className={customEmailStyles.fieldsContainerChild}>
              <Label className={customEmailStyles.label}>Status</Label>
              <Dropdown
                value={template.status}
                options={statusOptions}
                onChange={(e) => handleChange(index, "status", e.value)}
                placeholder="Select Status"
                style={{ width: "38%" }}
                className={customEmailStyles.dropDown}
              />
            </div>
          </div>
          <div className={`${customEmailStyles.EditorSection} card`}>
            <ReactQuill
              value={template.emailBody}
              onChange={(value) => handleChange(index, "emailBody", value)}
              style={{ height: "100%" }}
            />
          </div>
        </div>
      ))}
      <div className={customEmailStyles.addbutton}>
        <Button
          icon="pi pi-plus"
          label="Add"
          className="customSubmitButton"
          onClick={handleAdd}
        />
      </div>

      {/* <Button
        icon="pi pi-save"
        label="Submit"
        className="p-button-primary"
        onClick={handleSubmit}
      /> */}
    </div>
  );
};

export default CustomEmail;
