//Default imports
import * as React from "react";
import { useState, useEffect } from "react";
//Styles import
import "../../../../../External/commonStyles.module.scss";
//Common Service imports
import SPServices from "../../../../../CommonServices/SPServices";
import { Config } from "../../../../../CommonServices/Config";
import {
  ActionsMenu,
  multiplePeoplePickerTemplate,
  peoplePickerTemplate,
  statusTemplate,
} from "../../../../../CommonServices/CommonTemplates";
import {
  IApprovalConfigDetails,
  IApprovalStages,
  IPeoplePickerDetails,
} from "../../../../../CommonServices/interface";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const ApprovalWorkFlow = () => {
  //useStates
  const [approvalConfigDetails, setApprovalConfigDetails] = useState<
    IApprovalConfigDetails[]
  >([]);
  console.log("approvalConfigDetails", approvalConfigDetails);

  //Set Actions PopUp:
  const actionsWithIcons = () => [
    {
      label: "View",
      icon: "pi pi-eye",
      className: "customView",
      command: () => {},
    },
    {
      label: "Edit",
      icon: "pi pi-file-edit",
      className: "customEdit",
      command: (event: any) => {},
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      className: "customDelete",
      command: (event: any) => {},
    },
  ];

  //Get ApprovalConfig List Details
  const getApprovalConfigList = async () => {
    try {
      const res = await SPServices.SPReadItems({
        Listname: Config.ListNames.ApprovalConfig,
        Select: "*",
        Orderby: "Modified",
        Orderbydecorasc: false,
        Filter: [
          {
            FilterKey: "IsDelete",
            Operator: "eq",
            FilterValue: "false",
          },
        ],
      });
      const tempArr: IApprovalConfigDetails[] = await Promise.all(
        res.map(async (item: any) => {
          const allStages: IApprovalStages[] = await getApprovalStageConfigList(
            item.ID
          );
          return {
            id: item?.ID,
            category: item?.CategoryId,
            apprvalFlowName: item?.ApprovalFlowName,
            approvalProcess: item?.ApprovalProcess,
            rejectionFlow: item?.RejectionFlow,
            stages: allStages,
          };
        })
      );

      console.log("tempArr", tempArr);
      setApprovalConfigDetails([...tempArr]);
    } catch (e) {
      console.log("Get Approval Config error", e);
    }
  };

  // Get Approval Stage Config List
  const getApprovalStageConfigList = async (parentID: number) => {
    try {
      console.log("parentID", parentID);
      const res = await SPServices.SPReadItems({
        Listname: Config.ListNames.ApprovalStageConfig,
        Select: "*,Approver/Id,Approver/Title,Approver/EMail",
        Expand: "Approver",
        Orderby: "Modified",
        Orderbydecorasc: false,
        Filter: [
          {
            FilterKey: "ParentApproval",
            Operator: "eq",
            FilterValue: parentID.toString(),
          },
        ],
      });
      const stages: IApprovalStages[] = res.map((item: any) => ({
        stage: item?.Stage,
        approver:
          item?.Approver?.map((approver: any) => ({
            id: approver?.Id,
            name: approver?.Title,
            email: approver?.EMail,
          })) || [],
      }));

      return stages;
    } catch (e) {
      console.log("Get stage level approver error", e);
    }
  };

  //Approval Type
  const renderApprovalTypeColumn = (rowData) => {
    return (
      <div>
        {rowData?.approvalProcess === 1
          ? statusTemplate("Parallel")
          : statusTemplate("Sequence")}
      </div>
    );
  };
  //Render Approvers column
  const renderApproversColumn = (rowData) => {
    console.log("rowData", rowData);
    const approvers: IPeoplePickerDetails[] = rowData?.stages.flatMap((e) =>
      e?.approver.map((approver) => ({
        id: approver?.id,
        name: approver?.name,
        email: approver?.email,
      }))
    );
    return (
      <div>
        {approvers.length > 1
          ? multiplePeoplePickerTemplate(approvers)
          : peoplePickerTemplate(approvers[0])}
      </div>
    );
  };
  //Render Action column
  const renderActionColumn = (rowData) => {
    const menuModel = actionsWithIcons(); // rowData pass panrom da
    return <ActionsMenu items={menuModel} />;
  };

  useEffect(() => {
    getApprovalConfigList();
  }, []);

  return (
    <>
      <div className="customDataTableContainer">
        <DataTable
          value={approvalConfigDetails}
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage={
            <>
              <p style={{ textAlign: "center" }}>No Records Found</p>
            </>
          }
        >
          <Column field="apprvalFlowName" header="name"></Column>
          <Column
            field="stages"
            header="Approvers"
            body={renderApproversColumn}
          ></Column>
          <Column
            field="approvalProcess"
            header="Type"
            body={renderApprovalTypeColumn}
            style={{ width: "10rem" }}
          ></Column>
          <Column field="Action" body={renderActionColumn}></Column>
        </DataTable>
      </div>
    </>
  );
};

export default ApprovalWorkFlow;
