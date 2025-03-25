//Default Imports:
import * as React from "react";
import { useState, useEffect } from "react";
//Common Services Imports:
import SPServices from "../../../../../CommonServices/SPServices";
import { Config } from "../../../../../CommonServices/Config";
import {
  IActionBooleans,
  IEmailTemplateConfigDetails,
  IRightSideBarContents,
} from "../../../../../CommonServices/interface";
import { ActionsMenu } from "../../../../../CommonServices/CommonTemplates";
//PrimeReact Imports:
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Label } from "office-ui-fabric-react";
//Styles Imports:
import EmailWorkFlowStyles from "./EmailWorkFlow.module.scss";
import "./EmailWorkFlowStyle.css";
import "../../../../../External/style.css";

const EmailWorkFlow = ({
  setEmailWorkFlowSideBarContent,
  setEmailWorkFlowSideBarVisible,
}) => {
  //State Variables:
  const [getEmailTemplateContent, setEmailTemplateContent] = useState<
    IEmailTemplateConfigDetails[]
  >([]);
  const [actionsBooleans, setActionsBooleans] = useState<IActionBooleans>({
    ...Config.InitialActionsBooleans,
  });
  const [templateData, setTemplateData] = useState<IEmailTemplateConfigDetails>(
    {
      ...Config?.EmailTemplateConfigDetails,
    }
  );
  const [isValidation, setValidation] = useState<boolean>(false);

  //Get Email Template Contents:
  const getEmailTemplateContents = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames?.EmailTemplateConfig,
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
        const tempEmailTemplateContentsArr = res.map((item: any) => ({
          id: item?.ID,
          templateName: item?.TemplateName,
          emailBody: item?.EmailBody,
        }));
        setEmailTemplateContent(tempEmailTemplateContentsArr);
      })
      .catch((err) => console.log("Error in getEmailTemplateContents", err));
  };

  //Handle Action View and Edit:
  const handleAction = (
    action: string,
    rowData: IEmailTemplateConfigDetails
  ) => {
    const selected = getEmailTemplateContent.find(
      (item) => item?.id === rowData?.id
    );
    if (selected) {
      if (action === "view") {
        setActionsBooleans({ isView: true, isEdit: false });
      } else if (action === "edit") {
        setActionsBooleans({ isView: false, isEdit: true });
      }
      setTemplateData({
        id: selected.id,
        templateName: selected?.templateName || "",
        emailBody: selected?.emailBody || "",
      });
      setEmailWorkFlowSideBarVisible(true);
    }
  };

  //Handle Delete:
  const handleDelete = (rowData: IEmailTemplateConfigDetails) => {
    const json = {
      IsDelete: true,
    };
    SPServices.SPUpdateItem({
      Listname: Config.ListNames?.EmailTemplateConfig,
      ID: rowData.id,
      RequestJSON: json,
    })
      .then(() => {
        getEmailTemplateContents();
      })
      .catch((err) => {
        console.log("Error in Deleting Email Template", err);
      });
  };

  //Handle Change in Template Data:
  const handleChange = (key: string, value: string) => {
    setTemplateData((prev) => ({ ...prev, [key]: value }));
    console.log(value);
  };

  //Submit the Email Template:
  const handleSubmit = () => {
    if (actionsBooleans.isEdit && templateData.id) {
      const json = {
        TemplateName: templateData.templateName,
        EmailBody: templateData.emailBody,
      };
      SPServices.SPUpdateItem({
        Listname: Config.ListNames?.EmailTemplateConfig,
        ID: templateData.id,
        RequestJSON: json,
      })
        .then((res) => {
          getEmailTemplateContents();
          setEmailWorkFlowSideBarVisible(false);
          setActionsBooleans({ ...Config.InitialActionsBooleans });
          setTemplateData({ ...Config?.EmailTemplateConfigDetails });
        })
        .catch((err) => console.log("Error in Updating Email Template", err));
    } else {
      const json = {
        TemplateName: templateData.templateName,
        EmailBody: templateData.emailBody,
      };
      SPServices.SPAddItem({
        Listname: Config.ListNames?.EmailTemplateConfig,
        RequestJSON: json,
      })
        .then((res) => {
          getEmailTemplateContents();
          setEmailWorkFlowSideBarVisible(false);
          setActionsBooleans({ ...Config.InitialActionsBooleans });
          setTemplateData({ ...Config?.EmailTemplateConfigDetails });
        })
        .catch((err) => console.log("Error in Creating Email Template", err));
    }
  };

  //Actions Menu Details:
  const getActionsWithIcons = (rowData: IEmailTemplateConfigDetails) => [
    {
      label: "View",
      icon: "pi pi-eye",
      command: () => handleAction("view", rowData),
    },
    {
      label: "Edit",
      icon: "pi pi-file-edit",
      command: () => handleAction("edit", rowData),
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => handleDelete(rowData),
    },
  ];

  //check validation:
  const validateFunction = () => {
    let isValidation: boolean =
      !templateData?.templateName || !templateData?.emailBody;
    setValidation(isValidation);
    return !isValidation;
  };

  //Render Action Column:
  const renderActionColumn = (rowData: IEmailTemplateConfigDetails) => {
    return <ActionsMenu items={getActionsWithIcons(rowData)} />;
  };

  //MainContents Goes to RightSideBar:
  const EmailWorkFlowSideBarContents = () => (
    <>
      <h4 className={EmailWorkFlowStyles.EmailWorkFlowSideBarHeading}>
        {actionsBooleans.isEdit
          ? "Edit email template"
          : actionsBooleans.isView
          ? "View email template"
          : "Add email template"}
      </h4>
      <div>
        <Label className={EmailWorkFlowStyles.label}>Name</Label>
        <InputText
          value={templateData?.templateName}
          onChange={(e) => handleChange("templateName", e.target.value)}
          disabled={actionsBooleans.isView}
          style={{ width: "38%" }}
        />
        <div>
          {isValidation && !templateData?.templateName && (
            <span className="errorMsg">Name is required</span>
          )}
        </div>
        <div className={`${EmailWorkFlowStyles.EditorSection} card`}>
          <Editor
            value={templateData?.emailBody}
            onTextChange={(e) => handleChange("emailBody", e.htmlValue)}
            style={{ height: "320px" }}
            readOnly={actionsBooleans?.isView}
          />
          <div>
            {isValidation && !templateData?.emailBody && (
              <span className="errorMsg">EmailBody is required</span>
            )}
          </div>
        </div>
        <div className={EmailWorkFlowStyles.EmailWorkFlowSideBarButtons}>
          <Button
            icon="pi pi-times"
            label="Cancel"
            className="customCancelButton"
            onClick={() => {
              setEmailWorkFlowSideBarVisible(false);
              setActionsBooleans({ ...Config.InitialActionsBooleans });
              setTemplateData({ ...Config?.EmailTemplateConfigDetails });
              setValidation(false);
            }}
          />
          {!actionsBooleans.isView && (
            <Button
              icon="pi pi-save"
              label="Submit"
              className="customSubmitButton"
              onClick={() => {
                if (validateFunction()) {
                  handleSubmit();
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  );

  useEffect(() => {
    getEmailTemplateContents();
  }, []);

  useEffect(() => {
    setEmailWorkFlowSideBarContent((prev: IRightSideBarContents) => ({
      ...prev,
      EmailWorkFlowContent: EmailWorkFlowSideBarContents(),
    }));
  }, [actionsBooleans, templateData, isValidation]);

  return (
    <div className="customDataTableContainer">
      <DataTable
        value={getEmailTemplateContent}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage={<p style={{ textAlign: "center" }}>No Records Found</p>}
      >
        <Column
          style={{ width: "80%" }}
          field="templateName"
          header="Template Name"
        />
        <Column
          style={{ width: "20%" }}
          field="Action"
          body={renderActionColumn}
          //   body={(rowData) => (
          //     <ActionsMenu items={getActionsWithIcons(rowData)} />
          //   )}
        />
      </DataTable>
    </div>
  );
};

export default EmailWorkFlow;
