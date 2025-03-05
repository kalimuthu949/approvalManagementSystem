//Default Imports:
import * as React from "react";
import { useEffect, useState } from "react";
//PrimeReact Imports:
import { Button } from "primereact/button";
//CommonService Imports:
import {
  IPeoplePickerDetails,
  IRequestHubDetails,
} from "../../../../CommonServices/interface";
import SPServices from "../../../../CommonServices/SPServices";
import { Config } from "../../../../CommonServices/Config";

const WorkflowActionButtons = ({
  context,
  requestsHubDetails,
  setRequestsHubDetails,
}) => {
  //Current User:
  const currentUser = context?._pageContext?._user?.email;
  console.log(requestsHubDetails, "requestsHubDetails");

  const isCurrentUserPrimaryApprover = requestsHubDetails?.some(
    (item: IRequestHubDetails) =>
      item?.approvalJson?.some(
        (value: any) =>
          value?.Approvers[value?.userApprover]?.email === currentUser
      )
  );

  const ApproveRequests = async () => {
    const updatedDetails = requestsHubDetails.map(
      (item: IRequestHubDetails) => {
        const updatedItem: any = {
          ...item,
          approvalJson: item.approvalJson.map((value: any) => {
            if (value.ApprovalType === "Sequence") {
              return {
                ...value,
                userApprover: (value.userApprover || 0) + 1, // Increment userApprover only for Sequence
              };
            }
            return value;
          }),
        };
        updateSharePointList(updatedItem);
        return updatedItem;
      }
    );
    setRequestsHubDetails(updatedDetails);
  };

  const RejectRequests = async () => {
    const updatedDetails = requestsHubDetails.map(
      (item: IRequestHubDetails) => {
        const updatedItem: any = {
          ...item,
          approvalJson: item.approvalJson.map((value: any) => ({
            ...value,
            userApprover: null, // Reset userApprover to null
          })),
        };
        updateSharePointList(updatedItem);
        return updatedItem;
      }
    );
    setRequestsHubDetails(updatedDetails);
  };

  const ResubmitRequests = () => {
    const updatedDetails = requestsHubDetails.map(
      (item: IRequestHubDetails) => {
        const updatedItem: any = {
          ...item,
          approvalJson: item.approvalJson.map((value: any) => ({
            ...value,
            userApprover: 0, // Reset userApprover to 0
          })),
        };
        updateSharePointList(updatedItem);
        return updatedItem;
      }
    );
    setRequestsHubDetails(updatedDetails);
  };

  const showResubmit = requestsHubDetails?.some((item: IRequestHubDetails) =>
    item?.approvalJson?.some(
      (value: any) =>
        value.userApprover === null && // Only when rejected
        !value?.Approvers?.some(
          (approver: IPeoplePickerDetails) => approver?.email === currentUser
        )
    )
  );

  const updateSharePointList = async (updatedItem: IRequestHubDetails) => {
    SPServices.SPUpdateItem({
      Listname: Config?.ListNames?.RequestsHub,
      RequestJSON: {
        ApprovalJson: JSON.stringify(updatedItem.approvalJson),
      },
      ID: updatedItem?.id,
    })
      .then(() => {
        console.log("SharePoint list updated successfully");
      })
      .catch((e) => {
        console.log("Error while updating SharePoint list", e);
      });
  };

  return (
    <>
      <div style={{ marginTop: "20px" }}>
        {isCurrentUserPrimaryApprover ? (
          <>
            <Button
              onClick={() => ApproveRequests()}
              style={{ marginRight: "20px" }}
              label="Approve"
            />
            <Button
              onClick={() => RejectRequests()}
              style={{ marginRight: "20px" }}
              label="Reject"
            />
          </>
        ) : showResubmit ? (
          <>
            <Button onClick={() => ResubmitRequests()} label="Re_submit" />
          </>
        ) : null}
      </div>
    </>
  );
};

export default WorkflowActionButtons;
