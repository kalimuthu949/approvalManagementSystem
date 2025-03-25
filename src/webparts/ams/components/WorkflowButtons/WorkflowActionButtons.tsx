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
  validateForm,
  approvalDetails,
  setApprovalDetails,
  setRequestsSideBarVisible,
  context,
  updatedRecord,
  requestsHubDetails,
  setRequestsHubDetails,
  itemID,
}) => {
  //useStates
  const [submitBtn, setSubmitBtn] = useState(false);
  const [reSubmit, setReSubmit] = useState(false);
  const [approvalBtn, setapprovalBtn] = useState(false);
  const [author, setAuthor] = useState<IPeoplePickerDetails>();
  const [approverDescriptionErrMsg, setApproverDescriptionErrMsg] =
    useState<string>("");
  //Variables
  const loginUser = context._pageContext._user.email;
  const currentRec = requestsHubDetails?.find((e) => e.id === itemID);

  //Get RequestHubDetails List
  const getRequestHubDetails = () => {
    SPServices.SPReadItemUsingId({
      Listname: Config.ListNames.RequestsHub,
      Select: "*,Author/ID,Author/Title,Author/EMail",
      Expand: "Author",
      SelectedId: itemID,
    })
      .then((Item: any) => {
        setAuthor({
          id: Item.Author.ID,
          name: Item.Author.Title,
          email: Item.Author.EMail,
        });
      })
      .catch((err: any) => console.log("error getRequestHubDetails", err));
  };

  //Update Status by approver
  const updateStatusByApprover = (data, email, newStatusCode) => {
    const updatedDetails = requestsHubDetails?.map(
      (item: IRequestHubDetails) => {
        if (item.id === itemID) {
          var updateStage = null;
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
                    stage.ApprovalType === 2
                      ? updatedApprovers.every(
                          (approver) => approver.statusCode === 1
                        )
                      : stage.ApprovalType === 1 &&
                        updatedApprovers.some(
                          (approver) => approver.statusCode === 1
                        );
                  // Then, check if anyone approvers have statusCode === 2
                  const anyoneRejected = updatedApprovers.some(
                    (approver) => approver.statusCode === 2
                  );
                  // Update CurrentStage
                  const updateStageVal = allApproved
                    ? approvalFlow.Currentstage === approvalFlow.TotalStages
                      ? ((statusUpdate = "Approved"),
                        (updateStage = approvalFlow.Currentstage))
                      : (updateStage = approvalFlow.Currentstage + 1)
                    : ((updateStage = approvalFlow.Currentstage),
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
              Currentstage: updateStage,
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
                approvalFlow.RejectionFlow === 0
                  ? 1
                  : approvalFlow.RejectionFlow === 1 &&
                    approvalFlow.Currentstage,

              stages: approvalFlow.stages.map((stage) => {
                //Update stageStatusCode
                const stageStatusCodeByUser =
                  approvalFlow.RejectionFlow === 0
                    ? 0
                    : stage.stageStatusCode === 2
                    ? 0
                    : stage.stageStatusCode;

                //Update approvers
                const stageApproversByUser = stage.approvers?.map((approver) =>
                  approvalFlow.RejectionFlow === 0
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

  //Add Records in Approval History
  const addApprovalHistory = async (Process) => {
    const user: any = await SPServices.getCurrentUsers();
    SPServices.SPAddItem({
      Listname: Config.ListNames.ApprovalHistory,
      RequestJSON: {
        ParentIDId: approvalDetails?.parentID,
        Stage: approvalDetails?.stage,
        ApproverId: user.Id,
        Status: Process,
        Comments: approvalDetails?.comments || "",
      },
    })
      .then((e) => {
        console.log("Add approval history sucessfully", e);
      })
      .catch((e) => {
        console.log("Add approval history error", e);
      });
  };

  //On Approval Click
  const onApprovalClick = async () => {
    setApproverDescriptionErrMsg("");
    try {
      await addApprovalHistory("Approved");
      updateStatusByApprover(currentRec.approvalJson, loginUser, 1);
    } catch {
      (e) => {
        console.log("Approval history patch err", e);
      };
    }
  };

  //On Rejection Click
  const onRejectionClick = async () => {
    if (approvalDetails?.comments.trim().length > 0) {
      setApproverDescriptionErrMsg("");
      try {
        await addApprovalHistory("Rejected");
        updateStatusByApprover(currentRec.approvalJson, loginUser, 2);
      } catch {
        (e) => {
          console.log("Approval history patch err", e);
        };
      }
    } else {
      setApproverDescriptionErrMsg(
        "* Approver description is mandatory for rejection"
      );
    }
  };

  //On Re_Submit Click
  const onResubmitClick = async () => {
    const fieldsValidation: boolean = await validateForm();
    if (fieldsValidation) {
      SPServices.SPUpdateItem({
        Listname: Config.ListNames.RequestsHub,
        RequestJSON: updatedRecord,
        ID: itemID,
      })
        .then(() => updateStatusByUser(currentRec.approvalJson, loginUser, 0))
        .catch((err) => {
          console.log("Resubmission error", err);
        });
    }
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
        ? (loginUser === author?.email && setSubmitBtn(true),
          tempStageApprovers.some(
            (Approvers) => Approvers.email === loginUser
          ) &&
            tempStageApprovers.find((e) => e.email === loginUser).statusCode ===
              0 &&
            setapprovalBtn(true))
        : loginUser === author?.email &&
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
        setRequestsSideBarVisible(false);
      })
      .catch((e) => {
        console.log("Error while updating SharePoint list", e);
      });
  };

  //useEffect
  useEffect(() => {
    visibleButtons();
  });
  useEffect(() => {
    getRequestHubDetails();
  }, []);

  return (
    <>
      <div className={styles.workFlowButtons}>
        {/* {submitBtn && <Button label="Submit" />} */}
        {approvalBtn && (
          <>
            <span className="errorMsg">{approverDescriptionErrMsg}</span>
            <Button
              icon="pi pi-times"
              label="Cancel"
              className="customCancelButton"
              onClick={() => setRequestsSideBarVisible(false)}
            />
            <Button
              label="Reject"
              className="customRejectButton"
              icon="pi pi-times-circle"
              onClick={onRejectionClick}
            />
            <Button
              label="Approve"
              className="customSubmitButton"
              icon="pi pi-check-circle"
              onClick={onApprovalClick}
            />
          </>
        )}
        {reSubmit && (
          <Button
            label="Re_submit"
            className="customSubmitButton"
            icon="pi pi-save"
            onClick={onResubmitClick}
          />
        )}
      </div>
    </>
  );
};
export default WorkflowActionButtons;
