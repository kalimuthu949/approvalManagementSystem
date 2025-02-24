//Default Imports:
import * as React from "react";
import { useRef } from "react";
//PeoplePicker Imports;
import { Persona, PersonaSize } from "office-ui-fabric-react";
import { IPeoplePickerDetails, IToaster } from "./interface";
//React Icons Imports - Using Status Template Only :
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegTimesCircle } from "react-icons/fa";
import { LuClock9 } from "react-icons/lu";
//PrimeReact Imports:
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
//Common Style Imports:
import styles from "../External/commonStyles.module.scss";

//PeoplePicker Template:
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

//Custom Template :
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

//View,Edit,Delete Menu:
export const ActionsMenu = ({ items }) => {
  const menuLeft = useRef(null);
  return (
    <div className="customActionMenu">
      <Menu
        model={items}
        popup
        ref={menuLeft}
        id="popup_menu_left"
        style={{ width: "8.5rem" }}
      />
      <Button
        icon="pi pi-ellipsis-v"
        className="mr-2"
        onClick={(event) => {
          menuLeft.current.toggle(event);
        }}
        aria-controls="popup_menu_left"
        aria-haspopup
      />
    </div>
  );
};

//SideBar setups:
export const RightSidebar = ({ visible, onHide, contents }) => {
  return (
    <div>
      <Sidebar
        visible={visible}
        className="CustomSideBarContainer"
        position="right"
        onHide={onHide}
      >
        {contents}
      </Sidebar>
    </div>
  );
};

//Common Toast Notification setups:
export const toastNotify = (item: IToaster) => {
  return (
    <div className="flex flex-row align-items-center toastContainer">
      <div className={item.ClsName}>
        <i className={`pi ${item.iconName}`}></i>
      </div>
      <div>
        <div className="toast-heading">{item.type}</div>
        <div className="toast-message">{item.msg}</div>
      </div>
    </div>
  );
};
