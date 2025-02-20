//Default Imports:
import * as React from "react";
import { useState, useEffect, useRef } from "react";
//CommonService Imports:
import { Config } from "../../../../CommonServices/Config";
import {
  IBasicDropDown,
  IDropdownDetails,
  IRightSideBarContents,
} from "../../../../CommonServices/interface";
import SPServices from "../../../../CommonServices/SPServices";
//Style Imports:
import { LuBadgePlus } from "react-icons/lu";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import "../../../../External/style.css";
import headerStyles from "./Header.module.scss";
import DashboardPage from "../Dashboard/DashboardPage";
import CategoryConfig from "../Admin/CategoryConfig/CategoryConfig";
import { RightSidebar } from "../../../../CommonServices/CommonTemplates";

const Header = ({ context, currentPage }) => {
  //UseStates
  const [categoryFilterValue, setCategoryFilterValue] =
    useState<IDropdownDetails>({ ...Config.initialConfigDrop });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sideBarVisible, setSideBarVisible] = useState<boolean>(false);
  const [sideBarcontent, setSideBarContent] = useState<IRightSideBarContents>({
    ...Config.rightSideBarContents,
  });

  const userDetails = {
    name: context._pageContext._user.displayName,
    email: context._pageContext._user.email,
  };
  console.log("userDetails", userDetails);
  //Get Category From List
  const categoryFilter = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryConfig,
      Select: "*",
      Orderby: "Modified",
      Orderbydecorasc: false,
    })
      .then((res: any) => {
        console.log(res, "res");
        const TempArr: IBasicDropDown[] = [];
        res?.forEach((item: any) => {
          TempArr.push({ name: item.Category });
        });
        console.log("TempArr", TempArr);
        setCategoryFilterValue((prev: IDropdownDetails) => ({
          ...prev,
          categoryDrop: TempArr,
        }));
      })
      .catch((e) => {
        console.log("Get Category Error", e);
      });
  };

  const openSidebar = () => {
    setSideBarVisible(true);
  };

  //useEffect
  useEffect(() => {
    categoryFilter();
  }, []);
  return (
    <>
      <div className="headerContainer">
        <div className={headerStyles.profile_header_container}>
          <h1>Welcome back,</h1>
          <label>{userDetails.name}</label>
        </div>
        <div className={headerStyles.filter_header_container}>
          <label>{currentPage}</label>
          <Dropdown
            value={selectedCategory}
            options={categoryFilterValue.categoryDrop}
            onChange={(e) => setSelectedCategory(e.value)}
            optionLabel="name"
            placeholder="Category"
            className="w-full md:w-14rem"
          />
          <div className="addNewButton">
            <Button
              label="Add new"
              onClick={() => openSidebar()}
              icon={<LuBadgePlus />}
            />
            <RightSidebar
              visible={sideBarVisible}
              onHide={() => setSideBarVisible(false)}
              contents={
                currentPage == Config.sideNavPageNames.CategoryConfig
                  ? sideBarcontent?.categoryConfigContent
                  : ""
              }
            ></RightSidebar>
          </div>
        </div>
      </div>
      <div>
        {currentPage == Config.sideNavPageNames.Request ? (
          <DashboardPage />
        ) : currentPage == Config.sideNavPageNames.CategoryConfig ? (
          <CategoryConfig
            setCategorySideBarContent={setSideBarContent}
            setCategorySideBarVisible={setSideBarVisible}
          />
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default Header;
