//Default Imports:
import * as React from "react";
import { useState, useEffect } from "react";
//CommonService Imports:
import { ITabviewDetails } from "../../../../CommonServices/interface";
import { tabViewBar } from "../../../../CommonServices/CommonTemplates";
import CategoryConfig from "../Admin/CategoryConfig/CategoryConfig";
import ApprovalWorkFlow from "../Admin/ApprovalWorkFlow/ApprovalWorkFlow";
import EmailWorkFlow from "../Admin/EmailWorkFlow/EmailWorkFlow";

const ApprovalConfig = ({
  setTabView,
  setApprovalConfigSideBarContent,
  setApprovalConfigSideBarVisible,
}) => {
  return (
    <>
      {/* <div className="ViewMenTabs">{viewMenu}</div> */}
      <div className="tabViewContents">
        {setTabView == 0 ? (
          <CategoryConfig
            setCategorySideBarContent={setApprovalConfigSideBarContent}
            setCategorySideBarVisible={setApprovalConfigSideBarVisible}
          />
        ) : setTabView == 1 ? (
          <ApprovalWorkFlow
            setApprovalSideBarContent={setApprovalConfigSideBarContent}
            setApprovalSideBarVisible={setApprovalConfigSideBarVisible}
          />
        ) : setTabView == 2 ? (
          <EmailWorkFlow
            setEmailWorkFlowSideBarContent={setApprovalConfigSideBarContent}
            setEmailWorkFlowSideBarVisible={setApprovalConfigSideBarVisible}
          />
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default ApprovalConfig;
