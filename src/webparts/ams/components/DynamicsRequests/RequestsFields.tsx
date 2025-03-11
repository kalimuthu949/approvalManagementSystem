//Default Imports:
import * as React from "react";
import { useState, useEffect } from "react";
//CommonService Imports:
import SPServices from "../../../../CommonServices/SPServices";
import { Config } from "../../../../CommonServices/Config";
import {
  IRightSideBarContents,
  ISectionColumnsConfig,
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

const RequestsFields = ({
  categoryId,
  setRequestsDashBoardContent,
  setDynamicRequestsSideBarVisible,
}) => {
  const [dynamicFields, setDynamicFields] = useState<ISectionColumnsConfig[]>(
    []
  );
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

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
          FilterValue: categoryId.toString(),
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
          });
          setDynamicFields([...tempArr]);
        });
      })
      .catch((e) => {
        console.log(e, "getSectionColumnsConfig");
      });
  };

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
      console.log("Form Data: ", formData);
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
                  </Label>
                  <InputText
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
                    {field.columnName}
                  </Label>
                  <InputTextarea
                    id={field.columnName}
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
          <div className={`${dynamicFieldsStyles.sideBarButtonContainer}`}>
            <Button
              icon="pi pi-times"
              label="Cancel"
              className="customCancelButton"
              onClick={() => handleCancel()}
            />
            <Button
              icon="pi pi-save"
              label="Submit"
              className="customSubmitButton"
              onClick={() => {
                handleSubmit();
              }}
            />
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
    if (categoryId) {
      getCategorySectionConfigDetails();
    }
  }, [categoryId]);

  useEffect(() => {
    setRequestsDashBoardContent((prev: IRightSideBarContents) => ({
      ...prev,
      RequestsDashBoardContent: DynamicRequestsFieldsSideBarContent(),
    }));
  }, [dynamicFields, formData, errors]);

  return <></>;
};

export default RequestsFields;
