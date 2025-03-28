// export default ExistingEmail;
import * as React from "react";
import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import SPServices from "../../../../../../../CommonServices/SPServices";
import { Config } from "../../../../../../../CommonServices/Config";
import ExistingEmailstyles from "./ExisitingEmail.module.scss";
import { Label } from "office-ui-fabric-react";

const ExistingEmail = () => {
  //State Variables:
  const [getTemplateNameOptions, setTemplateNameOptions] = useState([]);
  const [selectedDropValues, setSelectedDropValues] = useState<any>({
    Approval: null,
    Reject: null,
    Resubmit: null,
    Rework: null,
  });

  //GetEmailTemplateConfigDetails:
  const getEmailTemplateConfigDetails = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames?.EmailTemplateConfig,
      Orderby: "Modified",
      Orderbydecorasc: false,
      Select: "*",
      Filter: [{ FilterKey: "IsDelete", Operator: "eq", FilterValue: "false" }],
    }).then((res) => {
      const templateOptions = res
        .map((item: any) => item?.TemplateName)
        .filter((v: any, i: any, a: any) => a.indexOf(v) === i) // Remove duplicates
        .map((name: string) => ({ label: name, value: name }));

      setTemplateNameOptions(templateOptions);
    });
  };

  // Handle dropdown change
  const handleFlowChange = (key: string, value: string) => {
    // setSelectedDropValues((prev: any) => ({ ...prev, [key]: value }));
    const updatedValues = { ...selectedDropValues, [key]: value };
    setSelectedDropValues(updatedValues);
    sessionStorage.setItem("selectedDropValues", JSON.stringify(updatedValues));
  };

  // Fetch email templates
  useEffect(() => {
    const storedValues = sessionStorage.getItem("selectedDropValues");
    if (storedValues) {
      setSelectedDropValues(JSON.parse(storedValues));
    }
    getEmailTemplateConfigDetails();
    getEmailTemplateConfigDetails();
  }, []);

  return (
    <div className={ExistingEmailstyles.existingEmailContainer}>
      {["Approval", "Reject", "Resubmit", "Rework"].map((flowName) => (
        <div key={flowName} className={ExistingEmailstyles.emailRow}>
          <Label className={ExistingEmailstyles.label}>{flowName}</Label>
          <div className={ExistingEmailstyles.dropDownContainer}>
            <Dropdown
              value={selectedDropValues[flowName]}
              options={getTemplateNameOptions}
              onChange={(e) => handleFlowChange(flowName, e.value)}
              placeholder="Enter here"
              className={ExistingEmailstyles.dropDown}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExistingEmail;
