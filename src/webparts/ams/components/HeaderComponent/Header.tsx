//Default Imports:
import * as React from "react";
import { useState, useEffect, useRef } from "react";
//CommonService Imports:
import { Config } from "../../../../CommonServices/Config";
import {
  IBasicDropDown,
  IDropdownDetails,
  IRightSideBarContents,
  IUserDetails,
  ITabviewDetails,
  IBasicFilterCategoryDrop,
} from "../../../../CommonServices/interface";
import SPServices from "../../../../CommonServices/SPServices";
//Style Imports:
import { LuBadgePlus } from "react-icons/lu";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import {
  RightSidebar,
  tabViewBar,
} from "../../../../CommonServices/CommonTemplates";
import { Persona } from "office-ui-fabric-react";
import { IoMdNotificationsOutline } from "react-icons/io";
import "../../../../External/style.css";
import headerStyles from "./Header.module.scss";
import "./HeaderStyle.css";
//Children's component import
import DashboardPage from "../Dashboard/DashboardPage";
import CategoryConfig from "../Admin/CategoryConfig/CategoryConfig";
import MyRequestPage from "../Dashboard/MyRequest";
import ApprovalWorkFlow from "../Admin/ApprovalWorkFlow/ApprovalWorkFlow";
import MyApprovalPage from "../Dashboard/MyApproval";
import AllRequestPage from "../Dashboard/AllRequest";
import AddRequestsFields from "../DynamicsRequests/AddRequestFields";

const Header = ({ context, currentPage }) => {
  //UseStates
  const [categoryFilterValue, setCategoryFilterValue] =
    useState<IDropdownDetails>({ ...Config.initialConfigDrop });
  const [selectedCategory, setSelectedCategory] =
    useState<IBasicFilterCategoryDrop>();
  const [sideBarVisible, setSideBarVisible] = useState<boolean>(false);
  const [sideBarcontent, setSideBarContent] = useState<IRightSideBarContents>({
    ...Config.rightSideBarContents,
  });
  const [activeTabViewBar, setActiveTabViewBar] = useState(0);
  const userDetails: IUserDetails = {
    name: context._pageContext._user.displayName,
    email: context._pageContext._user.email,
  };
  const [addRequest, setAddRequest] = useState<boolean>(false);
  //Get Category From List
  const categoryFilter = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryConfig,
      Select: "*",
      Orderby: "Modified",
      Orderbydecorasc: false,
    })
      .then((res: any) => {
        const TempArr: IBasicFilterCategoryDrop[] = [];
        res?.forEach((item: any) => {
          TempArr.push({ name: item.Category, id: item.ID });
        });
        setCategoryFilterValue((prev: IDropdownDetails) => ({
          ...prev,
          categoryDrop: TempArr,
        }));
      })
      .catch((e) => {
        console.log("Get Category Error", e);
      });
  };

  const openSidebar = async () => {
    if (currentPage === Config.sideNavPageNames.Request) {
      await setAddRequest(true);
    }
    setSideBarVisible(true);
  };

  //Set TabView Content
  const declareTabViewBar = () => {
    switch (currentPage) {
      case Config.sideNavPageNames.Request:
        const TemptabContent: ITabviewDetails[] = [
          {
            id: 1,
            name: "All Request",
          },
          {
            id: 2,
            name: "My Request",
          },
          {
            id: 3,
            name: "My Approval",
          },
        ];
        const tempTabView = tabViewBar(
          TemptabContent,
          activeTabViewBar,
          setActiveTabViewBar
        );
        return <>{tempTabView}</>;
      case Config.sideNavPageNames.CategoryConfig:
        return (
          <>
            <label>{currentPage}</label>
          </>
        );
      case Config.sideNavPageNames.ApproveConfig:
        return (
          <>
            <label>{currentPage}</label>
          </>
        );
    }
  };
  //useEffect
  useEffect(() => {
    categoryFilter();
    declareTabViewBar();
  }, []);
  useEffect(() => {
    if (!sideBarVisible) {
      setAddRequest(false);
    }
  }, [sideBarVisible]);
  return (
    <>
      <div className="headerContainer">
        <div className={headerStyles.profile_header_container}>
          <div className={headerStyles.profile_header_content}>
            <h1>Welcome back,</h1>
            <label>{userDetails.name}</label>
          </div>
          <div className={headerStyles.profile_header_Icons}>
            <div className={headerStyles.notifyBell}>
              <IoMdNotificationsOutline />
            </div>
            <Persona
              imageUrl={`/_layouts/15/userphoto.aspx?size=S&username=${userDetails.email}`}
            />
          </div>
        </div>
        <div className={headerStyles.filter_header_container}>
          <div className={headerStyles.filter_header_pageName}>
            {declareTabViewBar()}
          </div>

          <Dropdown
            value={selectedCategory}
            options={categoryFilterValue.categoryDrop}
            onChange={(e) => {
              setSelectedCategory(e.value);
            }}
            showClear
            filter
            optionLabel="name"
            placeholder="Category"
            className="w-full md:w-14rem"
          />
          <div className="addNewButton">
            <Button
              label="Add new"
              onClick={async () => {
                openSidebar();
              }}
              icon={<LuBadgePlus />}
            />
            <RightSidebar
              visible={sideBarVisible}
              onHide={() => {
                setSideBarVisible(false);
              }}
              contents={
                currentPage == Config.sideNavPageNames.CategoryConfig
                  ? sideBarcontent?.categoryConfigContent
                  : currentPage == Config.sideNavPageNames.Request
                  ? addRequest
                    ? sideBarcontent?.AddRequestsDashBoardContent
                    : sideBarcontent?.RequestsDashBoardContent
                  : currentPage == Config.sideNavPageNames.ApproveConfig
                  ? sideBarcontent?.ApprovalConfigContent
                  : ""
              }
            ></RightSidebar>
          </div>
        </div>
      </div>
      <div>
        {currentPage == Config.sideNavPageNames.Request ? (
          <>
            {addRequest && (
              <AddRequestsFields
                categoryFilterValue={categoryFilterValue}
                context={context}
                setRequestsDashBoardContent={setSideBarContent}
                setDynamicRequestsSideBarVisible={setSideBarVisible}
              />
            )}

            {/* <DashboardPage
            sideBarVisible={sideBarVisible}
              context={context}
              setRequestsDashBoardContent={setSideBarContent}
              setDynamicRequestsSideBarVisible={setSideBarVisible}
            /> */}
            {activeTabViewBar === 0 && (
              <AllRequestPage
                filterCategory={selectedCategory}
                sideBarVisible={sideBarVisible}
                context={context}
                setRequestsDashBoardContent={setSideBarContent}
                setDynamicRequestsSideBarVisible={setSideBarVisible}
              />
            )}
            {activeTabViewBar === 1 && (
              <MyRequestPage
                filterCategory={selectedCategory}
                sideBarVisible={sideBarVisible}
                context={context}
                setRequestsDashBoardContent={setSideBarContent}
                setDynamicRequestsSideBarVisible={setSideBarVisible}
              />
            )}
            {activeTabViewBar === 2 && (
              <MyApprovalPage
                filterCategory={selectedCategory}
                sideBarVisible={sideBarVisible}
                context={context}
                setRequestsDashBoardContent={setSideBarContent}
                setDynamicRequestsSideBarVisible={setSideBarVisible}
              />
            )}
          </>
        ) : currentPage == Config.sideNavPageNames.CategoryConfig ? (
          <CategoryConfig
            setCategorySideBarContent={setSideBarContent}
            setCategorySideBarVisible={setSideBarVisible}
          />
        ) : (
          <>
            <ApprovalWorkFlow
              setApprovalSideBarContent={setSideBarContent}
              setApprovalSideBarVisible={setSideBarVisible}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Header;
