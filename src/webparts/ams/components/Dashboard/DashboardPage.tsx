//Default Imports:
import * as React from "react";
import { useEffect, useState } from "react";
//primeReact Imports:
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
//Styles Imports:
import dashboardStyles from "./Dashboard.module.scss";
import "../../../../External/style.css";
//CommonService Imports:
import {
  ActionsMenu,
  multiplePeoplePickerTemplate,
  peoplePickerTemplate,
  statusTemplate,
} from "../../../../CommonServices/CommonTemplates";
import SPServices from "../../../../CommonServices/SPServices";
import { Config } from "../../../../CommonServices/Config";
import {
  IPeoplePickerDetails,
  IRequestHubDetails,
} from "../../../../CommonServices/interface";
import WorkflowActionButtons from "../WorkflowButtons/WorkflowActionButtons";

const DashboardPage = ({ context }) => {
  //State Variables:
  const [requestsDetails, setRequestsDetails] = useState<IRequestHubDetails[]>(
    []
  );
  //Set Actions PopUp:
  const actionsWithIcons = [
    {
      label: "View",
      icon: "pi pi-eye",
      className: "customView",
      command: (event: any) => {},
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

  //Get RequestHub Details:
  const getRequestsHubDetails = async () => {
    try {
      const res = await SPServices.SPReadItems({
        Listname: Config.ListNames.RequestsHub,
        Select: "*,Category/Id,Category/Category",
        Expand: "Category",
        Orderby: "Modified",
        Orderbydecorasc: false,
      });

      const temArr: IRequestHubDetails[] = await Promise.all(
        res.map(async (item: any) => {
          const approvers = await fetchApprovers(item.CategoryId);
          return {
            id: item.ID,
            requestId: item?.RequestID ? item?.RequestID : "R-00001",
            status: item?.Status,
            category: item?.Category?.Category,
            approvers,
            approvalJson: JSON.parse(item?.ApprovalJson),
          };
        })
      );
      setRequestsDetails([...temArr]);
    } catch (e) {
      console.log("RequestsHub Error", e);
    }
  };

  //Get Fetch Approvers from ApprovalConfig:
  const fetchApprovers = async (categoryId: number) => {
    try {
      const res = await SPServices.SPReadItems({
        Listname: Config.ListNames.ApprovalConfig,
        Select: "*,Approvers/Id,Approvers/Title,Approvers/EMail",
        Expand: "Approvers",
        Orderby: "Modified",
        Orderbydecorasc: false,
        Filter: [
          {
            FilterKey: "Category",
            Operator: "eq",
            FilterValue: categoryId.toString(),
          },
        ],
      });

      return res.flatMap(
        (item: any) =>
          item?.Approvers?.map((element: any) => ({
            id: element?.Id,
            name: element?.Title,
            email: element?.EMail,
          })) || []
      );
    } catch (e) {
      console.log("Fetch Approvers Error", e);
    }
  };

  //Render Status Column:
  const renderStatusColumn = (rowData: IRequestHubDetails) => {
    return <div>{statusTemplate(rowData?.status)}</div>;
  };

  //Render Approvers Column:
  const renderApproversColumn = (rowData: IRequestHubDetails) => {
    return (
      <div>
        {rowData?.approvers.length > 1
          ? multiplePeoplePickerTemplate(rowData?.approvers)
          : peoplePickerTemplate(rowData?.approvers[0])}
      </div>
    );
  };

  //Render Action Column:
  const renderActionColumn = (rowData: IRequestHubDetails) => {
    return <ActionsMenu items={actionsWithIcons} />;
  };

  useEffect(() => {
    getRequestsHubDetails();
  }, []);

  return (
    <>
      <div className="customDataTableContainer">
        <DataTable
          value={requestsDetails}
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage={
            <>
              <p style={{ textAlign: "center" }}>No Records Found</p>
            </>
          }
        >
          <Column
            className={dashboardStyles.highlightedRequestId}
            field="requestId"
            header="Request id"
          ></Column>
          <Column field="category" header="Category"></Column>
          <Column
            field="approvers"
            header="Approvers"
            body={renderApproversColumn}
          ></Column>
          <Column
            field="status"
            header="Status"
            body={renderStatusColumn}
            style={{ width: "10rem" }}
          ></Column>
          <Column field="Action" body={renderActionColumn}></Column>
        </DataTable>
      </div>
      <div>
        {requestsDetails?.length > 0 && (
          <WorkflowActionButtons
            context={context}
            requestsHubDetails={requestsDetails}
            setRequestsHubDetails={setRequestsDetails}
          />
        )}
      </div>
    </>
  );
};

export default DashboardPage;
