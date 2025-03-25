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

interface IApprover {
  name: string;
  email: string;
  id: number;
}

interface IStage {
  id?: number;
  stage: number;
  approvers: IApprover[];
  typeOfWorkflow: string;
  rejectType: string;
}

const ApprovalWorkFlow = ({
  setApprovalSideBarContent,
  setApprovalSideBarVisible,
  context,
}) => {
  const [workflowName, setWorkflowName] = useState("");
  const [rejectType, setRejectType] = useState("");
  const [stages, setStages] = useState<IStage[]>([]);
  const [removedStageIds, setRemovedStageIds] = useState<number[]>([]);
  const [validationError, setValidationError] = useState("");

  const approvalConfigId = 12; // Assuming this is passed as a prop

  useEffect(() => {
    if (approvalConfigId) {
      fetchApprovalData(approvalConfigId);
    }
  }, [approvalConfigId]);

  const fetchApprovalData = async (id) => {
    try {
      // Fetch data from ApprovalConfig list
      const listDetails = {
        Listname: "ApprovalConfig",
        SelectedId: approvalConfigId,
      };
      const approvalConfigItem = await SPServices.SPReadItemUsingID(
        listDetails
      ).then(function (data) {
        if (data.length > 0) {
          data.map((item: any) => {
            setWorkflowName(item.ApprovalFlowName);
            setRejectType(item.ApprovalProcess);
          });
        }
      });

      const listApproverDetails = {
        Listname: "ApprovalStageConfig",
        Select: "*,Approver/Id,Approver/Title,Approver/EMail",
        Expand: "Approver/Id,Approver/Title,Approver/EMail",
        Filter: [
          {
            FilterKey: "ParentApprovalId",
            Operator: "eq",
            FilterValue: `${approvalConfigId}`,
          },
        ],
      };

      let tempStages: any = [];
      // Fetch data from ApprovalStageConfig list
      const approvalStages = await SPServices.SPReadItems(
        listApproverDetails
      ).then(async function (data: any) {
        for (let i = 0; i < data.length; i++) {
          let tempArr: any = [];
          if (data[i].Approver.length > 0) {
            for (let j = 0; j < data[i].Approver.length; j++) {
              tempArr.push({
                id: data[i].Approver[j].Id,
                name: data[i].Approver[j].Title,
                email: data[i].Approver[j].EMail,
              });
            }
          }

          tempStages.push({
            id: data[i].ID,
            stage: data[i].Stage,
            approvers: tempArr,
            typeOfWorkflow: data[i].TypeOfWorkflow,
            rejectType: data[i].RejectType,
          });
        }

        if (tempStages.length > 0) {
          setStages(tempStages);
        }
      });
    } catch (error) {
      console.error("Error fetching approval data", error);
    }
  };

  const addStage = () => {
    var newStages = stages.slice();
    newStages.push({
      stage: newStages.length + 1,
      approvers: [],
      typeOfWorkflow: "",
      rejectType: "",
    });
    setStages(newStages);
  };

  const removeStage = (stageIndex) => {
    var newStages = stages.slice();
    const removedStage = newStages.splice(stageIndex, 1)[0];
    if (removedStage.id) {
      setRemovedStageIds([...removedStageIds, removedStage.id]);
    }
    setStages(newStages);
  };

  const updateApprover = (stageIndex, approvers) => {
    var newStages = stages.slice();
    newStages[stageIndex].approvers = approvers.map((user) => ({
      id: user.id,
      name: user.text,
      email: user.secondaryText,
    }));
    setStages(newStages);
  };

  const updateTypeOfWorkflow = (stageIndex, value) => {
    var newStages = stages.slice();
    newStages[stageIndex].typeOfWorkflow = value;
    setStages(newStages);
  };

  const updateRejectType = (value) => {
    setRejectType(value);
    var newStages = stages.slice();
    newStages.forEach((stage) => {
      stage.rejectType = value;
    });
    setStages(newStages);
  };

  const handleSubmit = async () => {
    for (var i = 0; i < stages.length; i++) {
      if (stages[i].approvers.length === 0) {
        setValidationError("All stages must have at least one approver.");
        return;
      }
      for (var j = 0; j < stages[i].approvers.length; j++) {
        if (!stages[i].approvers[j].name) {
          setValidationError("All name fields must be filled.");
          return;
        }
      }
    }
    setValidationError("");

    try {
      // Add or update the workflow in the ApprovalConfig list
      const approvalConfigItem = {
        Title: workflowName,
        ApprovalFlowName: workflowName,
        TotalStages: stages.length,
        ApprovalProcess: rejectType,
        RejectionFlow: rejectType,
      };

      const dataApproval = {
        Listname: "ApprovalConfig",
        RequestJSON: approvalConfigItem,
      };
      const approvalConfigId = await SPServices.SPAddItem(dataApproval);
      console.log("ApprovalConfig ID", approvalConfigId);

      // Remove deleted stages from the ApprovalStageConfig list
      for (let id of removedStageIds) {
        // await SPServices.SPDeleteItem("ApprovalStageConfig", id);
      }

      // Add or update each stage in the ApprovalStageConfig list
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const approvers = stage.approvers.map((approver) => approver.id);
        const approvalManagementItem = {
          Title: `Stage ${stage.stage}`,
          ParentApprovalId: approvalConfigId.data.ID,
          Stage: stage.stage,
          ApproverId: { results: approvers },
          TypeOfWorkflow: stage.typeOfWorkflow,
          RejectType: stage.rejectType,
        };

        const dataApprovers = {
          Listname: "ApprovalStageConfig",
          RequestJSON: approvalManagementItem,
        };

        if (stage.id) {
          // await SPServices.SPUpdateItem(
          //   "ApprovalStageConfig",
          //   stage.id,
          //   dataApprovers
          // );
        } else {
          // await SPServices.SPAddItem(dataApprovers);
        }
      }

      console.log("Data submitted successfully");
    } catch (error) {
      console.error("Error submitting data", error);
    }
  };

  const options = [
    { label: "Everyone should approve", value: 1 },
    { label: "Anyone can approve", value: 2 },
  ];

  const rejectOptions = [
    { label: "Reject Option 1", value: 1 },
    { label: "Reject Option 2", value: 2 },
    { label: "Reject Option 3", value: 3 },
  ];

  return (
    <div>
      <div
        className={`${ApprovalWorkFlowStyles.topSection}`}
        style={{ marginBottom: "1rem" }}
      >
        <div className={`${ApprovalWorkFlowStyles.nameDiv}`}>
          <Label className={`${ApprovalWorkFlowStyles.label}`}>Name</Label>
          <InputText
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow Name"
            style={{ marginRight: "0.5rem", width: "100%" }}
          />
        </div>
        <div className={`${ApprovalWorkFlowStyles.rejectDiv}`}>
          <Label className={`${ApprovalWorkFlowStyles.label}`}>
            Rejection Process
          </Label>
          <Dropdown
            value={rejectType}
            options={rejectOptions}
            onChange={(e) => updateRejectType(e.value)}
            placeholder="Select Reject Type"
            style={{ width: "100%" }}
          />
        </div>
      </div>
      {stages.map(function (stage, stageIndex) {
        return (
          <div key={stageIndex} style={{ marginBottom: "1rem" }}>
            <h4 className={`${ApprovalWorkFlowStyles.label}`}>
              Stage {stage.stage} Approver
            </h4>
            <div className={`${ApprovalWorkFlowStyles.stage}`}>
              <div>
                <PeoplePicker
              context={context}
              titleText="People"
              personSelectionLimit={3}
              required={true}
              groupName={""}
              webAbsoluteUrl={context._pageContext._web.absoluteUrl}
              showtooltip={true}
              disabled={false}
              ensureUser={true}
              defaultSelectedUsers={stage.approvers.map(
                (approver) => approver.email
              )}
              onChange={(items) => updateApprover(stageIndex, items)}
              principalTypes={[PrincipalType.User]}
              resolveDelay={1000}
            />
              </div>
              <div>
                <Label className={`${ApprovalWorkFlowStyles.label}`}>
                  Type
                </Label>
                <Dropdown
                  value={stage.typeOfWorkflow}
                  options={options}
                  onChange={(e) => updateTypeOfWorkflow(stageIndex, e.value)}
                  placeholder="Select Type of Workflow"
                  style={{ marginTop: "0.5rem" }}
                />
              </div>
              <div className={`${ApprovalWorkFlowStyles.deleteDiv}`}>
                <FaRegTrashAlt onClick={() => removeStage(stageIndex)} />
              </div>
            </div>
          </div>
        );
      })}
      <Button
        style={{ padding: "5px" }}
        icon="pi pi-plus"
        className="p-button-success"
        onClick={() => addStage()}
      />

      {validationError && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {validationError}
        </div>
      )}
      <div className={`${ApprovalWorkFlowStyles.buttonsDiv}`}>
        <div>
          <Button
            className="customSubmitButton"
            label="Submit"
            icon="pi pi-save"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkFlow;
