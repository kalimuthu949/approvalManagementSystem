//Default Imports:
import * as React from "react";
import { useState, useEffect } from "react";
//CommonService Imports:
import { ITabviewDetails } from "../../../../CommonServices/interface";
import { tabViewBar } from "../../../../CommonServices/CommonTemplates";
import CategoryConfig from "../Admin/CategoryConfig/CategoryConfig";
import ApprovalWorkFlow from "../Admin/ApprovalWorkFlow/ApprovalWorkFlow";

const ApprovalConfig = ({
  setApprovalConfigSideBarContent,
  setApprovalConfigSideBarVisible,
}) => {
  //Tab View state:
  const [activeTabView, setActiveTabView] = useState(0);
  //Tab View Details:
  const TemptabContent: ITabviewDetails[] = [
    {
      id: 1,
      name: "Category",
    },
    {
      id: 2,
      name: "Approver Workflow",
    },
    {
      id: 3,
      name: "Email Workflow",
    },
  ];

  const viewMenu = tabViewBar(TemptabContent, activeTabView, setActiveTabView);

  return (
    <>
      <div className="ViewMenTabs">{viewMenu}</div>
      <div className="tabViewContents">
        {activeTabView == 0 ? (
          <CategoryConfig
            setCategorySideBarContent={setApprovalConfigSideBarContent}
            setCategorySideBarVisible={setApprovalConfigSideBarVisible}
          />
        ) : activeTabView == 1 ? (
          <ApprovalWorkFlow
            setApprovalSideBarContent={setApprovalConfigSideBarContent}
            setApprovalSideBarVisible={setApprovalConfigSideBarVisible}
          />
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default ApprovalConfig;
