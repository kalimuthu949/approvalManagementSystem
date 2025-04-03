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
import AttachmentUploader from "../AttachmentUploader/AttachmentUploader";
import RequestsFields from "../DynamicsRequests/RequestsFields";
import { Item } from "@pnp/sp/items";
import Loader from "../Loader/Loader";

const MyApprovalPage = ({
  searchValue,
  filterCategory,
  context,
  sideBarVisible,
  setRequestsDashBoardContent,
  setDynamicRequestsSideBarVisible,
}) => {
  const loginUser = context._pageContext._user.email;
  //State Variables:
  const [requestsDetails, setRequestsDetails] = useState<IRequestHubDetails[]>(
    []
  );
  //Record Action
  const [recordAction, setRecordAction] = useState<string>("");
  const [navigateFrom, setNavigateFrom] = useState<string>("");
  //CategoryId
  // const [selectedCategoryId, setSelectedCategoryId] = useState<number>(null);
  const [currentRecord, setCurrentRecord] = useState<IRequestHubDetails>();
  const [showLoader,setShowLoader] = useState<boolean>(true);
  //Set Actions PopUp:
  const actionsWithIcons = (rowData: IRequestHubDetails) => [
    {
      label: "View",
      icon: "pi pi-eye",
      className: "customView",
      command: () => {
        setRecordAction("View");
        setCurrentRecord(rowData);
        // setSelectedCategoryId(rowData.CategoryId);
        setDynamicRequestsSideBarVisible(true);
      },
    },
    rowData.status === "Pending" &&
    rowData.approvalJson[0].stages
      .find((e) => e.stage === rowData.approvalJson[0].Currentstage)
      .approvers.find((e) => e.email === loginUser)?.statusCode === 0
      ? {
          label: "Edit",
          icon: "pi pi-file-edit",
          className: "customEdit",
          command: (event: any) => {
            setRecordAction("Edit");
            setCurrentRecord(rowData);
            setDynamicRequestsSideBarVisible(true);
          },
        }
      : "",
  ];

  //Get RequestHub Details:
  const getRequestsHubDetails = async () => {
    try {
      const res = await SPServices.SPReadItems({
        Listname: Config.ListNames.RequestsHub,
        Select:
          "*,Category/Id,Category/Category,Author/Id,Author/Title,Author/EMail",
        Expand: "Category,Author",
        Orderby: "Modified",
        Orderbydecorasc: false,
        Filter: [
          { FilterKey: "IsDelete", Operator: "eq", FilterValue: "false" },
        ],
      });
      const tempArr: IRequestHubDetails[] = await Promise.all(
        res.map(async (item: any) => {
          return {
            id: item.ID,
            requestId: item?.RequestID ? item?.RequestID : "R-00001",
            status: item?.Status,
            category: item?.Category?.Category,
            CategoryId: item?.CategoryId,
            approvalJson: JSON.parse(item?.ApprovalJson),
            createdDate: item?.Created,
            author: {
              id: item?.Author.Id,
              email: item?.Author.EMail,
              name: item?.Author.Title,
            },
          };
        })
      );

      filterRecords(tempArr);
    } catch (e) {
      console.log("RequestsHub Error", e);
    }
  };

  //Filter records for approvers
  const filterRecords = (tempArr) => {
    const filterTempArr = tempArr.filter((item) =>
      // filterCategory
      //   ? item?.CategoryId === filterCategory.id &&
      //     item.approvalJson[0].stages.some(
      //       (stage) =>
      //         stage.stage <= item.approvalJson[0].Currentstage &&
      //         stage.approvers.some((approver) => approver.email === loginUser)
      //     ):
      item.approvalJson[0].stages.some(
        (stage) =>
          stage.stage <= item.approvalJson[0].Currentstage &&
          stage.approvers.some((approver) => approver.email === loginUser)
      )
    );
    setRequestsDetails([...filterTempArr]);
    setShowLoader(false);
  };

  //Render Status Column:
  const renderStatusColumn = (rowData: IRequestHubDetails) => {
    return <div>{statusTemplate(rowData?.status)}</div>;
  };

  //Render Stage level Approver Column:
  const renderStagelevelApproverColumns = (
    rowData: IRequestHubDetails,
    Columncode: number
  ) => {
    //Current Stage
    const currentSatge = () => {
      return rowData.approvalJson[0].Currentstage;
    };
    //Current Stage Approvers
    const approvers = (): IPeoplePickerDetails[] => {
      return rowData.approvalJson.flatMap((e) =>
        e?.stages
          .find((stage) => stage?.stage === e.Currentstage)
          .approvers.flatMap((approver) => ({
            id: approver.id,
            name: approver.name,
            email: approver.email,
          }))
      );
    };
    //Current Pending Approval on that stage
    const pendingApprovals = (): IPeoplePickerDetails[] => {
      return rowData.approvalJson.flatMap((e) =>
        e?.stages
          .find((stage) => stage?.stage === e.Currentstage)
          .approvers.flatMap((approver) =>
            approver.statusCode === 0
              ? {
                  id: approver.id,
                  name: approver.name,
                  email: approver.email,
                }
              : []
          )
      );
    };
    //Approved Approvers
    const approvedApprovers = (): IPeoplePickerDetails[] => {
      return rowData.approvalJson.flatMap((e) =>
        e?.stages.flatMap((stage) =>
          stage.approvers.flatMap((approver) =>
            approver.statusCode === 1
              ? {
                  id: approver.id,
                  name: approver.name,
                  email: approver.email,
                }
              : []
          )
        )
      );
    };
    return (
      <div>
        {Columncode === 1 && rowData.status !== "Approved"
          ? approvers().length > 1
            ? multiplePeoplePickerTemplate(approvers())
            : peoplePickerTemplate(approvers()[0])
          : Columncode === 2 && rowData.status !== "Approved"
          ? pendingApprovals().length > 1
            ? multiplePeoplePickerTemplate(pendingApprovals())
            : peoplePickerTemplate(pendingApprovals()[0])
          : Columncode === 3
          ? approvedApprovers().length > 1
            ? multiplePeoplePickerTemplate(approvedApprovers())
            : peoplePickerTemplate(approvedApprovers()[0])
          : Columncode === 4 && rowData.status !== "Approved"
          ? currentSatge()
          : ""}
      </div>
    );
  };

  //Render Action Column:
  const renderActionColumn = (rowData: IRequestHubDetails) => {
    const menuModel = actionsWithIcons(rowData);
    return <ActionsMenu items={menuModel.filter((e) => e !== "")} />;
  };

  useEffect(() => {
    getRequestsHubDetails();
    setNavigateFrom("MyApproval");
  }, [null, filterCategory, searchValue]);

  return (
     <>
        {
          showLoader?<Loader/>:
    <>
      <div className="customDataTableContainer">
        <DataTable
          globalFilter={searchValue}
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
            hidden
            field="approvalJson"
            header="Current Stage"
            body={(e) => renderStagelevelApproverColumns(e, 4)}
          ></Column>
          <Column
            hidden
            field="approvalJson"
            header="Approvers"
            body={(e) => renderStagelevelApproverColumns(e, 1)}
          ></Column>
          <Column
            hidden
            field="approvalJson"
            header="Pending Approval"
            body={(e) => renderStagelevelApproverColumns(e, 2)}
          ></Column>
          <Column
            hidden
            field="approvalJson"
            header="Approved by"
            body={(e) => renderStagelevelApproverColumns(e, 3)}
          ></Column>
          <Column
            field="author"
            header="User name"
            body={(e) => peoplePickerTemplate(e?.author)}
          ></Column>
          <Column
            field="author"
            header="E mail"
            body={(e) => e?.author?.email}
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
      {currentRecord && (
        <RequestsFields
          context={context}
          requestsDetails={requestsDetails}
          setRequestsDetails={setRequestsDetails}
          sideBarVisible={sideBarVisible}
          currentRecord={currentRecord}
          recordAction={recordAction}
          navigateFrom={navigateFrom}
          setRequestsDashBoardContent={setRequestsDashBoardContent}
          setDynamicRequestsSideBarVisible={setDynamicRequestsSideBarVisible}
        />
      )}
    </>}</>
  );
};

export default MyApprovalPage;
