//Deafault Imports:
import * as React from "react";
import { useEffect, useState } from "react";
//Prime React Imports:
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
//Common Service Imports:
import SPServices from "../../../../../CommonServices/SPServices";
//Styles Imports:
import "../../../../../External/style.css";
import ApprovalWorkFlowStyles from "./ApprovalWorkFlow.module.scss";
import { Label } from "office-ui-fabric-react";
import {
  IApprovalDetailsPatch,
  IApprovalFlowValidation,
  IApprovalStages,
  IBasicDropDown,
  IDropdownDetails,
  IPeoplePickerDetails,
  IRightSideBarContents,
} from "../../../../../CommonServices/interface";
import { sp } from "@pnp/sp";
import { Config } from "../../../../../CommonServices/Config";

const ApprovalWorkFlow = ({
  approvalTableRender,
  ApprovalConfigSideBarVisible,
  setApprovalSideBarContent,
  setApprovalSideBarVisible,
  context,
}) => {
  const [approvalFlowDetails, setApprovalFlowDetails] =
    useState<IApprovalDetailsPatch>({
      ...Config.ApprovalConfigDefaultDetails,
    });
  const [rejectionFlowChoice, setRejectionFlowChoice] =
    useState<IDropdownDetails>({
      ...Config.initialConfigDrop,
    });
  const [approvalType, setApprovalType] = useState<IDropdownDetails>({
    ...Config.initialConfigDrop,
  });
  const [validation, setValidation] = useState<IApprovalFlowValidation>({
    ...Config.ApprovalFlowValidation,
  });
  console.log("validation", validation);

  //ApprovalConfig Details Patch
  const addApprovalConfigDetails = (addData: IApprovalDetailsPatch) => {
    SPServices.SPAddItem({
      Listname: Config.ListNames.ApprovalConfig,
      RequestJSON: {
        ApprovalFlowName: addData?.apprvalFlowName,
        TotalStages: addData?.totalStages,
        RejectionFlow: addData?.rejectionFlow,
      },
    })
      .then(async (res: any) => {
        console.log("addApprovalConfigDetails res", res);
        await addData?.stages?.forEach((stage) =>
          addApprovalStageConfigDetails(res?.data.ID, stage)
        );
        setApprovalFlowDetails({ ...Config.ApprovalConfigDefaultDetails });
        approvalTableRender();
        setApprovalSideBarVisible(false);
      })
      .catch((err) => console.log("addApprovalConfigDetails error", err));
  };

  //ApprovalStageConfig Details Patch
  const addApprovalStageConfigDetails = (
    parentId: number,
    stage: IApprovalStages
  ) => {
    const tempApprovers = stage?.approver?.map((e) => e.id);
    console.log("tempApprovers", tempApprovers);
    SPServices.SPAddItem({
      Listname: Config.ListNames.ApprovalStageConfig,
      RequestJSON: {
        ParentApprovalId: parentId,
        Stage: stage?.stage,
        ApprovalProcess: stage?.approvalProcess,
        ApproverId: { results: tempApprovers },
      },
    })
      .then((res: any) => {
        console.log("addApprovalStageConfigDetails res", res);
      })
      .catch((err) => console.log("addApprovalStageConfigDetails error", err));
  };

  //Get rejectionFlowChoice Choices
  const getRejectionFlowChoices = () => {
    SPServices.SPGetChoices({
      Listname: Config.ListNames.ApprovalConfig,
      FieldName: "RejectionFlow",
    })
      .then((res: any) => {
        console.log("res", res);
        const temArr: IBasicDropDown[] = [];
        res?.Choices.map((choice) =>
          temArr.push({
            name: choice,
          })
        );
        setRejectionFlowChoice((prev: IDropdownDetails) => ({
          ...prev,
          rejectionFlowDrop: temArr,
        }));
      })
      .catch((err) => {
        console.log("getRejectionFlowChoices error", err);
      });
  };

  //onChange handle
  const onChangeHandle = (key, value) => {
    approvalFlowDetails[key] = value;
    setApprovalFlowDetails({ ...approvalFlowDetails });
  };

  //Add stage
  const addStage = () => {
    const tempStage: IApprovalStages[] = approvalFlowDetails?.stages.slice();
    tempStage.push({
      stage: approvalFlowDetails?.stages?.length + 1,
      approvalProcess: null,
      approver: [],
    });
    approvalFlowDetails["stages"] = [...tempStage];
    setApprovalFlowDetails({
      ...approvalFlowDetails,
      totalStages: approvalFlowDetails?.stages?.length,
    });
  };

  //Remove stage
  const removeStage = (stageIndex) => {
    var newStages = approvalFlowDetails?.stages?.slice();
    newStages.splice(stageIndex, 1)[0];
    const orderedStage: IApprovalStages[] = [];
    newStages.forEach((e, i) =>
      orderedStage.push({
        stage: i + 1,
        approvalProcess: e?.approvalProcess,
        approver: e?.approver,
      })
    );
    console.log("orderedStage", orderedStage);
    approvalFlowDetails["stages"] = [...orderedStage];
    setApprovalFlowDetails({
      ...approvalFlowDetails,
      totalStages: orderedStage.length,
    });
    setValidation({ ...Config.ApprovalFlowValidation });
  };

  //Update stage
  const updateStage = (
    index: number,
    key: keyof IApprovalStages,
    value: any
  ) => {
    const tempUpdateStage: IApprovalStages[] = [...approvalFlowDetails.stages];
    var keyValue;
    if (tempUpdateStage[index]) {
      if (key === "approver") {
        debugger;
        const tempApproverArr: IPeoplePickerDetails[] = [];
        value.map((e) =>
          tempApproverArr.push({
            id: e?.id,
            name: e?.text,
            email: e?.secondaryText,
          })
        );
        keyValue = [...tempApproverArr];
      } else {
        keyValue = value;
      }
      tempUpdateStage[index] = { ...tempUpdateStage[index], [key]: keyValue }; // Update the specific key
    }
    console.log("tempUpdateStage", tempUpdateStage);
    setApprovalFlowDetails({
      ...approvalFlowDetails,
      stages: tempUpdateStage,
    });
  };

  //Validation
  const validRequiredField = async (action) => {
    if (
      approvalFlowDetails?.apprvalFlowName.trim().length === 0 ||
      approvalFlowDetails?.rejectionFlow.trim().length === 0
    ) {
      validation["approvalConfigValidation"] =
        "Workflow name and Rejection process both are required";
    } else if (
      approvalFlowDetails?.stages.length === 0 &&
      action === "submit"
    ) {
      validation["approvalConfigValidation"] =
        "Atleast one stage approver is required";
    } else if (
      (action === "addStage" || action === "submit") &&
      approvalFlowDetails?.apprvalFlowName.trim() &&
      approvalFlowDetails?.rejectionFlow.trim()
    ) {
      validation["approvalConfigValidation"] = "";
      if (approvalFlowDetails?.stages.length > 0) {
        const tempSatgeErr = approvalFlowDetails?.stages
          ?.map((e, index) =>
            e.approvalProcess === null || e.approver.length === 0 ? index : -1
          )
          .filter((e) => e !== -1);
        if (tempSatgeErr.length > 0) {
          validation["stageErrIndex"] = [...tempSatgeErr];
          validation["stageValidation"] = "People and type are required";
        } else if (tempSatgeErr.length === 0) {
          validation["stageErrIndex"] = [];
          validation["stageValidation"] = "";
        }
      } else {
        validation["stageErrIndex"] = [];
        validation["stageValidation"] = "";
      }
    }
    await setValidation({ ...validation });
    finalValidation(action);
  };
  // Final validation
  const finalValidation = (action) => {
    if (!validation?.approvalConfigValidation && !validation?.stageValidation) {
      {
        action === "addStage"
          ? addStage()
          : action === "submit"
          ? addApprovalConfigDetails(approvalFlowDetails)
          : "";
      }
    }
  };
  ///ApprovalConfigFlowContent
  const ApprovalConfigSidebarContent = () => (
    <>
      <div
        className={`${ApprovalWorkFlowStyles.topSection}`}
        style={{ marginBottom: "1rem" }}
      >
        <div className={`${ApprovalWorkFlowStyles.nameDiv}`}>
          <Label className={`${ApprovalWorkFlowStyles.label}`}>
            Name<span className="required">*</span>
          </Label>
          <InputText
            value={approvalFlowDetails?.apprvalFlowName}
            onChange={(e) => onChangeHandle("apprvalFlowName", e.target.value)}
            placeholder="Workflow Name"
            style={{ width: "100%" }}
          />
        </div>
        <div className={`${ApprovalWorkFlowStyles.rejectDiv}`}>
          <Label className={`${ApprovalWorkFlowStyles.label}`}>
            Rejection Process<span className="required">*</span>
          </Label>
          <Dropdown
            options={rejectionFlowChoice?.rejectionFlowDrop}
            value={rejectionFlowChoice?.rejectionFlowDrop.find(
              (e) => e?.name === approvalFlowDetails?.rejectionFlow
            )}
            optionLabel="name"
            onChange={(e) => onChangeHandle("rejectionFlow", e.value?.name)}
            placeholder="Select Reject Type"
            style={{ width: "100%" }}
          />
        </div>
      </div>
      <div>
        <span className="errorMsg">{validation?.approvalConfigValidation}</span>
      </div>
      {approvalFlowDetails?.stages?.map(function (stage, stageIndex) {
        return (
          <>
            <div key={stageIndex} style={{ marginTop: "20px" }}>
              <h4 className={`${ApprovalWorkFlowStyles.label}`}>
                Stage {stage.stage} Approver<span className="required">*</span>
              </h4>
              <div className={`${ApprovalWorkFlowStyles.stage}`}>
                <div>
                  <Label className={`${ApprovalWorkFlowStyles.label}`}>
                    People
                  </Label>
                  <PeoplePicker
                    context={context}
                    personSelectionLimit={3}
                    groupName={""}
                    showtooltip={true}
                    disabled={false}
                    ensureUser={true}
                    defaultSelectedUsers={approvalFlowDetails?.stages[
                      stageIndex
                    ].approver.map((approver) => approver.email)}
                    onChange={(items) =>
                      updateStage(stageIndex, "approver", items)
                    }
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={1000}
                  />
                </div>
                <div>
                  <Label className={`${ApprovalWorkFlowStyles.label}`}>
                    Type
                  </Label>
                  <Dropdown
                    value={approvalType?.approvalFlowType.find(
                      (e) =>
                        e?.id ===
                        approvalFlowDetails?.stages[stageIndex].approvalProcess
                    )}
                    options={approvalType?.approvalFlowType}
                    optionLabel="name"
                    onChange={(e) =>
                      updateStage(stageIndex, "approvalProcess", e.value?.id)
                    }
                    placeholder="Select Type of Workflow"
                    style={{ marginTop: "0.5rem" }}
                  />
                </div>
                <div className={`${ApprovalWorkFlowStyles.deleteDiv}`}>
                  <FaRegTrashAlt onClick={() => removeStage(stageIndex)} />
                </div>
              </div>
            </div>
            {validation?.stageErrIndex.some((e) => e === stageIndex) && (
              <div>
                <span className="errorMsg">{validation?.stageValidation}</span>
              </div>
            )}
          </>
        );
      })}
      <div className={`${ApprovalWorkFlowStyles.addStageButton}`}>
        <Button
          style={{ padding: "5px" }}
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => validRequiredField("addStage")}
        />
      </div>
      <div className={`${ApprovalWorkFlowStyles.buttonsDiv}`}>
        <>
          <Button
            className="customCancelButton"
            label="Cancel"
            icon="pi pi-times"
            onClick={() => {
              setApprovalSideBarVisible(false);
            }}
          />
          <Button
            className="customSubmitButton"
            label="Submit"
            icon="pi pi-save"
            onClick={() => validRequiredField("submit")}
          />
        </>
      </div>
    </>
  );

  //useEffects
  useEffect(() => {
    getRejectionFlowChoices();
  }, []);
  useEffect(() => {
    if (!ApprovalConfigSideBarVisible) {
      setValidation({ ...Config.ApprovalFlowValidation });
      setApprovalFlowDetails({ ...Config.ApprovalConfigDefaultDetails });
    }
  }, [ApprovalConfigSideBarVisible]);
  useEffect(() => {
    setApprovalSideBarContent((prev: IRightSideBarContents) => ({
      ...prev,
      ApprovalConfigContent: ApprovalConfigSidebarContent(),
    }));
  }, [
    null,
    ApprovalConfigSideBarVisible,
    approvalFlowDetails,
    rejectionFlowChoice?.rejectionFlowDrop,
    validation,
  ]);

  return <></>;
};

export default ApprovalWorkFlow;
