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
import AddRequestsFields from "../DynamicsRequests/AddRequestFields";
import AllRequestPage from "./AllRequest";
import MyRequestPage from "./MyRequest";
import MyApprovalPage from "./MyApproval";

const DashboardPage = ({
  categoryFilterValue,
  addRequest,
  context,
  globelSearchValue,
  selectedCategory,
  activeTabViewBar,
  sideBarVisible,
  setRequestsDashBoardContent,
  setDynamicRequestsSideBarVisible,
}) => {
  console.log("globelSearchValue", globelSearchValue);
  return (
    <>
      {addRequest && (
        <AddRequestsFields
          categoryFilterValue={categoryFilterValue}
          context={context}
          setRequestsDashBoardContent={setRequestsDashBoardContent}
          setDynamicRequestsSideBarVisible={setDynamicRequestsSideBarVisible}
        />
      )}
      {activeTabViewBar === 0 && (
        <AllRequestPage
          searchValue={globelSearchValue}
          filterCategory={selectedCategory}
          sideBarVisible={sideBarVisible}
          context={context}
          setRequestsDashBoardContent={setRequestsDashBoardContent}
          setDynamicRequestsSideBarVisible={setDynamicRequestsSideBarVisible}
        />
      )}
      {activeTabViewBar === 1 && (
        <MyRequestPage
          filterCategory={selectedCategory}
          sideBarVisible={sideBarVisible}
          context={context}
          setRequestsDashBoardContent={setRequestsDashBoardContent}
          setDynamicRequestsSideBarVisible={setDynamicRequestsSideBarVisible}
        />
      )}
      {activeTabViewBar === 2 && (
        <MyApprovalPage
          searchValue={globelSearchValue}
          filterCategory={selectedCategory}
          sideBarVisible={sideBarVisible}
          context={context}
          setRequestsDashBoardContent={setRequestsDashBoardContent}
          setDynamicRequestsSideBarVisible={setDynamicRequestsSideBarVisible}
        />
      )}
    </>
  );
};

export default DashboardPage;
