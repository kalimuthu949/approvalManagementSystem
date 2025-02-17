//Default Imports:
import * as React from "react";
import { useEffect, useState } from "react";
//primeReact Imports:
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const DashboardPage = () => {
  interface DummyRequest {
    requestId: string;
    requestType: string;
    userName: string;
    email: string;
    status: string;
  }
  const dummyArray: DummyRequest[] = [
    {
      requestId: "R-02356",
      requestType: "Laptop",
      userName: "Ralph edwards",
      email: "ralph@gmail.com",
      status: "Pending",
    },
    {
      requestId: "R-02356",
      requestType: "Laptop",
      userName: "Ralph edwards",
      email: "ralph@gmail.com",
      status: "Approved",
    },
    {
      requestId: "R-02356",
      requestType: "Laptop",
      userName: "Ralph edwards",
      email: "ralph@gmail.com",
      status: "Rejected",
    },
    {
      requestId: "R-02356",
      requestType: "Laptop",
      userName: "Ralph edwards",
      email: "ralph@gmail.com",
      status: "Pending",
    },
  ];
  return (
    <>
      <div>
        <DataTable
          value={dummyArray}
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage={
            <>
              <p style={{ textAlign: "center" }}>No Records Found</p>
            </>
          }
        >
          <Column field="requestId" header="Request id"></Column>
          <Column field="requestType" header="Request type"></Column>
          <Column field="userName" header="User name"></Column>
          <Column field="email" header="E-mail"></Column>
          <Column field="status" header="Status"></Column>
        </DataTable>
      </div>
    </>
  );
};

export default DashboardPage;
