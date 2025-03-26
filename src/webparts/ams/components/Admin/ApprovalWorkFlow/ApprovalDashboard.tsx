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
import ApprovalWorkFlow from "./ApprovalWorkFlow";

const ApprovalDashboard = ({
  setApprovalSideBarContent,
  setApprovalSideBarVisible,
  context,
}) => {
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
  const getApprovalConfig = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.ApprovalConfig,
      Select: "*,Category/Id",
      Expand: "Category",
    })
      .then(async (res) => {
        console.log(res);
        const tempArr: IApprovalConfigDetails[] = [];
        await res?.forEach(async (item: any) => {
          tempArr.push({
            id: item?.ID,
            category: item?.CategoryId,
            apprvalFlowName: item?.ApprovalFlowName,
            totalStages: item?.TotalStages,
            rejectionFlow: item?.RejectionFlow,
            stages: await getApprovalStageConfig(item?.ID),
          });
          console.log("tempArr", tempArr);
          setApprovalConfigDetails([...tempArr]);
        });
      })
      .catch((err) => console.log("getApprovalConfig", err));
  };

  //get Approval Stage Config
  const getApprovalStageConfig = async (parentID) => {
    try {
      const res = SPServices.SPReadItems({
        Listname: Config.ListNames.ApprovalStageConfig,
        Select: "*,ParentApproval/Id,Approver/Id,Approver/EMail,Approver/Title",
        Expand: "ParentApproval,Approver",
        Filter: [
          {
            FilterKey: "ParentApprovalId",
            Operator: "eq",
            FilterValue: parentID.toString(),
          },
        ],
      });
      const tempStageArr: IApprovalStages[] = [];
      (await res)?.forEach((item: any) => {
        tempStageArr.push({
          stage: item?.Stage,
          approvalProcess: item?.ApprovalProcess,
          approver: item?.Approver.map((e) => ({
            id: e?.Id,
            email: e?.EMail,
            name: e?.Title,
          })),
        });
      });
      return tempStageArr;
    } catch {
      (err) => console.log("getApprovalStageConfig error", err);
    }
  };

  //Approval Type
  const renderRejectionFlowColumn = (rowData) => {
    return <div>{statusTemplate(rowData?.rejectionFlow)}</div>;
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
    getApprovalConfig();
  }, []);

  return (
    <>
      <ApprovalWorkFlow
        setApprovalSideBarContent={setApprovalSideBarContent}
        setApprovalSideBarVisible={setApprovalSideBarVisible}
        context={context}
      />
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
            field="rejectionFlow"
            body={renderRejectionFlowColumn}
            style={{ width: "15rem" }}
            header="Rejection flow"
          ></Column>
          <Column field="Action" body={renderActionColumn}></Column>
        </DataTable>
      </div>
    </>
  );
};

export default ApprovalDashboard;
