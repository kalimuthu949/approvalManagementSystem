import { Persona, PersonaSize } from "office-ui-fabric-react";
import * as React from "react";
import { IPeoplePickerDetails } from "./interface";
//React Icons Imports - Using Status Template Only :
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegTimesCircle } from "react-icons/fa";
import { LuClock9 } from "react-icons/lu";
//Common Style Imports:
import styles from "../External/commonStyles.module.scss";

export const peoplePickerTemplate = (user: IPeoplePickerDetails) => {
  return (
    <>
      {user && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Persona
            styles={{
              root: {
                margin: "0 !important;",
                ".ms-Persona-details": {
                  display: "none",
                },
              },
            }}
            imageUrl={
              "/_layouts/15/userphoto.aspx?size=S&username=" + user?.email
            }
            title={user?.name}
            size={PersonaSize.size24}
          />
          <p
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              margin: 0,
            }}
            className="displayText"
            title={user?.name}
          >
            {user?.name}
          </p>
        </div>
      )}
    </>
  );
};

export const statusTemplate = (status: string) => {
  return (
    <div
      className={styles.statusItem}
      style={{
        backgroundColor: getColors(status).bgColor,
        color: getColors(status).color,
      }}
    >
      <div style={{ fontSize: "16px" }}>{getIcons(status)}</div>
      <div>{status}</div>
    </div>
  );
};

const getIcons = (status: string) => {
  switch (status) {
    case "Pending":
      return <LuClock9 />;

    case "Approved":
      return <FaRegCheckCircle />;

    case "Rejected":
      return <FaRegTimesCircle />;

    default:
      return null;
  }
};

const getColors = (status: string) => {
  let colors = {
    bgColor: "",
    color: "",
  };
  switch (status) {
    case "Pending":
      colors.bgColor = "#eaf1f6";
      colors.color = "##2a6d9c";
      break;
    case "Approved":
      colors.bgColor = "#e8f6ed";
      colors.color = "#16a34a";
      break;
    case "Rejected":
      colors.bgColor = "#f6e8e8";
      colors.color = "#b23d3f";
      break;
    default:
      return null;
  }
  return colors;
};
