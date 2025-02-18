//Default Imports:
import * as React from "react";
import { useEffect, useState, useRef } from "react";
//primeReact Imports:
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
//Styles Imports:
import dashboardStyles from "./Dashboard.module.scss";
import "../../../../External/style.css";
import { statusTemplate } from "../../../../CommonServices/CommonTemplates";
import { Menu } from "primereact/menu";

const DashboardPage = () => {
  interface DummyRequest {
    id: number;
    requestId: string;
    requestType: string;
    userName: string;
    email: string;
    status: string;
  }
  const dummyArray: DummyRequest[] = [
    {
      id: 1,
      requestId: "R-02356",
      requestType: "Laptop",
      userName: "Ralph edwards",
      email: "ralph@gmail.com",
      status: "Pending",
    },
    {
      id: 2,
      requestId: "R-02356",
      requestType: "Laptop",
      userName: "Ralph edwards",
      email: "ralph@gmail.com",
      status: "Approved",
    },
    {
      id: 3,
      requestId: "R-02356",
      requestType: "Laptop",
      userName: "Ralph edwards",
      email: "ralph@gmail.com",
      status: "Rejected",
    },
    {
      id: 4,
      requestId: "R-02356",
      requestType: "Laptop",
      userName: "Ralph edwards",
      email: "ralph@gmail.com",
      status: "Pending",
    },
  ];

  //Set Actions PopUp:
  const menuLeft = useRef(null);
  const actionsWithIcons = [
    {
      label: "View",
      icon: "pi pi-eye",
      className: "customView",
      command: (event: any) => {
        console.log(event, "event");
      },
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

  const renderStatusColumn = (rowData: DummyRequest) => {
    return <div>{statusTemplate(rowData?.status)}</div>;
  };

  const renderActionColumn = (rowData: DummyRequest) => {
    return (
      <div className="customActionMenu">
        <Menu
          model={actionsWithIcons}
          popup
          ref={menuLeft}
          id="popup_menu_left"
          style={{ width: "8.5rem" }}
        />
        <Button
          icon="pi pi-ellipsis-v"
          className="mr-2"
          onClick={(event) => {
            menuLeft.current.toggle(event);
          }}
          aria-controls="popup_menu_left"
          aria-haspopup
        />
      </div>
    );
  };

  return (
    <>
      <div className="customDataTableContainer">
        <DataTable
          value={dummyArray}
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
          <Column field="requestType" header="Request type"></Column>
          <Column field="userName" header="User name"></Column>
          <Column field="email" header="E-mail"></Column>
          <Column
            field="status"
            header="Status"
            body={renderStatusColumn}
          ></Column>
          <Column field="Action" body={renderActionColumn}></Column>
        </DataTable>
      </div>
    </>
  );
};

export default DashboardPage;
