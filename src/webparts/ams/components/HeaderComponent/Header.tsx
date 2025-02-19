//Default Imports:
import * as React from "react";
import { useState, useEffect, useRef } from "react";
//CommonService Imports:
import { Config } from "../../../../CommonServices/Config";
import {
  IBasicDropDown,
  IDropdownDetails,
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

const Header = ({ currentPage }) => {
  //UseStates
  const [CategoryFilterValue, setCategoryFilterValue] =
    useState<IDropdownDetails>({ ...Config.initialConfigDrop });
  const [SelectedCategory, setSelectedCategory] = useState(null);
  console.log("CategoryFilterValue", CategoryFilterValue);

  //Get Category From List
  const CategoryFilter = () => {
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

  //useEffect
  useEffect(() => {
    CategoryFilter();
  }, []);
  return (
    <>
      <div className="headerContainer">
        <div className={headerStyles.ProfileHeader}>Test Profile</div>
        <div className={headerStyles.FilterHeader}>
          <label>{currentPage}</label>
          <Dropdown
            value={SelectedCategory}
            showClear
            options={CategoryFilterValue.categoryDrop}
            onChange={(e) => setSelectedCategory(e.value)}
            optionLabel="name"
            placeholder="Category"
            className="w-full md:w-14rem"
          />
          <div className="AddBtn">
            <Button label="Add new" icon={<LuBadgePlus />} />
          </div>
        </div>
      </div>
      <div>
        {currentPage == "Request" ? (
          <DashboardPage />
        ) : currentPage == "CategoryConfig" ? (
          <CategoryConfig />
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default Header;
