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
//Style Imports
import styles from "./WorkFlowActionButtons.module.scss";
import { Item } from "@pnp/sp/items";

const WorkflowActionButtons = ({
  context,
  requestsHubDetails,
  setRequestsHubDetails,
  itemID,
}) => {
  //useStates
  const [submitBtn, setSubmitBtn] = useState(false);
  const [reSubmit, setReSubmit] = useState(false);
  const [approvalBtn, setapprovalBtn] = useState(false);

  //Variables
  const createdUser = "Leowilson@chandrudemo.onmicrosoft.com";
  const loginUser = context._pageContext._user.email;
  const currentRec = requestsHubDetails?.find((e) => e.id === itemID);

  //Update Status by approver
  const updateStatusByApprover = (data, email, newStatusCode) => {
    const updatedDetails = requestsHubDetails?.map(
      (item: IRequestHubDetails) => {
        if (item.id === itemID) {
          var updateStatge = null;
          var statusUpdate = item?.status;
          const updatedItem: any = {
            ...item,
            approvalJson: data.map((approvalFlow) => ({
              ...approvalFlow,
              stages: approvalFlow.stages.map((stage) => {
                if (approvalFlow.Currentstage === stage.stage) {
                  // First, update the approvers' status codes
                  const updatedApprovers = stage.approvers.map((approver) =>
                    approver.email === email
                      ? { ...approver, statusCode: newStatusCode }
                      : approver
                  );
                  // Then, check if all approvers have statusCode === 1
                  const allApproved =
                    approvalFlow.ApprovalType === 2
                      ? updatedApprovers.every(
                          (approver) => approver.statusCode === 1
                        )
                      : approvalFlow.ApprovalType === 1 &&
                        updatedApprovers.some(
                          (approver) => approver.statusCode === 1
                        );
                  // Then, check if anyone approvers have statusCode === 2
                  const anyoneRejected = updatedApprovers.some(
                    (approver) => approver.statusCode === 2
                  );
                  // Update CurrentStage
                  const updateStatgeVal = allApproved
                    ? approvalFlow.Currentstage === approvalFlow.TotalStages
                      ? ((statusUpdate = "Approved"),
                        (updateStatge = approvalFlow.Currentstage))
                      : (updateStatge = approvalFlow.Currentstage + 1)
                    : ((updateStatge = approvalFlow.Currentstage),
                      anyoneRejected
                        ? (statusUpdate = "Rejected")
                        : (statusUpdate = statusUpdate));

                  return {
                    ...stage,
                    approvers: updatedApprovers,
                    stageStatusCode: allApproved
                      ? 1
                      : anyoneRejected
                      ? 2
                      : stage.stageStatusCode,
                  };
                } else {
                  return { ...stage };
                }
              }),
              Currentstage: updateStatge,
            })),
            status: statusUpdate,
          };
          updateSharePointList(updatedItem);
          return updatedItem;
        } else {
          return { ...item };
        }
      }
    );
    setRequestsHubDetails([...updatedDetails]);
  };

  //Update status by user
  const updateStatusByUser = (data, email, newStatusCode) => {
    //Update status and ApprovalJson
    const updatedDetails = requestsHubDetails?.map(
      (item: IRequestHubDetails) => {
        if (item.id === itemID) {
          const updatedItem: any = {
            ...item,
            status: "Pending",
            approvalJson: data.map((approvalFlow) => ({
              ...approvalFlow,
              Currentstage:
                approvalFlow.RejectionFlow === newStatusCode
                  ? 1
                  : approvalFlow.RejectionFlow === 1 &&
                    approvalFlow.Currentstage,

              stages: approvalFlow.stages.map((stage) => {
                //Update stageStatusCode
                const stageStatusCodeByUser =
                  approvalFlow.RejectionFlow === newStatusCode
                    ? 0
                    : stage.stageStatusCode === 2
                    ? 0
                    : stage.stageStatusCode;

                //Update approvers
                const stageApproversByUser = stage.approvers?.map((approver) =>
                  approvalFlow.RejectionFlow === newStatusCode
                    ? { ...approver, statusCode: 0 }
                    : approver.statusCode === 2
                    ? { ...approver, statusCode: 0 }
                    : { ...approver, statusCode: approver.statusCode }
                );
                return {
                  ...stage,
                  approvers: stageApproversByUser,
                  stageStatusCode: stageStatusCodeByUser,
                };
              }),
            })),
          };
          updateSharePointList(updatedItem);
          return updatedItem;
        } else {
          return { ...item };
        }
      }
    );
    setRequestsHubDetails([...updatedDetails]);
  };

  //On Approval Click
  const onApprovalClick = () => {
    updateStatusByApprover(currentRec.approvalJson, loginUser, 1);
  };

  //On Rejection Click
  const onRejectionClick = () => {
    updateStatusByApprover(currentRec.approvalJson, loginUser, 2);
  };

  //On Re_Submit Click
  const onResubmitClick = () => {
    updateStatusByUser(currentRec.approvalJson, loginUser, 0);
  };

  //Button Visibility
  const visibleButtons = () => {
    setSubmitBtn(false);
    setReSubmit(false);
    setapprovalBtn(false);
    const tempStage = currentRec.approvalJson[0].stages.find(
      (e) => e.stage === currentRec.approvalJson[0].Currentstage
    );
    const tempStageApprovers = [...tempStage.approvers];
    return (
      currentRec.status !== "Approved" &&
      (currentRec.status === "Pending"
        ? (loginUser === createdUser && setSubmitBtn(true),
          tempStageApprovers.some(
            (Approvers) => Approvers.email === loginUser
          ) &&
            tempStageApprovers.find((e) => e.email === loginUser).statusCode ===
              0 &&
            setapprovalBtn(true))
        : loginUser === createdUser &&
          currentRec.approvalJson[0].RejectionFlow !== 2 &&
          setReSubmit(true))
    );
  };

  //Update SharePoint List
  const updateSharePointList = async (updatedItem: IRequestHubDetails) => {
    SPServices.SPUpdateItem({
      Listname: Config?.ListNames?.RequestsHub,
      RequestJSON: {
        ApprovalJson: JSON.stringify(updatedItem.approvalJson),
        Status: updatedItem?.status,
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

//useEffect
  useEffect(() => {
    visibleButtons();
  });

  return (
    <>
      <div className={styles.workFlowButtons}>
        {submitBtn && <Button label="Submit" />}
        {approvalBtn && (
          <>
            <Button label="Approve" onClick={onApprovalClick} />
            <Button label="Reject" onClick={onRejectionClick} />
          </>
        )}
        {reSubmit && <Button label="Re_submit" onClick={onResubmitClick} />}
      </div>
    </>
  );
};
export default WorkflowActionButtons;
