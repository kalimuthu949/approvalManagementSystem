//Default Imports:
import * as React from "react";
import { useState, useEffect } from "react";
//Common Service Imports:
import SPServices from "../../../../../CommonServices/SPServices";
import { Config } from "../../../../../CommonServices/Config";
import {
  ICategoryDetails,
  ICategoryObjDetails,
} from "../../../../../CommonServices/interface";
import { ActionsMenu } from "../../../../../CommonServices/CommonTemplates";
//Styles Imports:
import "../../../../../External/style.css";
import categoryConfigStyles from "../CategoryConfig.module.scss";
//primeReact Imports:
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";

const CategoryConfig = () => {
  const [categoryDetails, setCategoryDetails] = useState<ICategoryDetails[]>(
    []
  );
  const [categoryDetailsObj, setCategoryDetailsObj] =
    useState<ICategoryObjDetails>({
      ...Config.InitialCategoryConfigDetails,
    });
  const [isValidation, setIsValidation] = useState<boolean>(false);
  const [visibleRight, setVisibleRight] = useState<boolean>(false);

  const getCategoryConfigDetails = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryConfig,
      Orderby: "Modified",
      Orderbydecorasc: false,
      Select: "*",
    }).then((res: any) => {
      const tempCategoryArray: ICategoryDetails[] = [];
      res.forEach((items: any) => {
        tempCategoryArray.push({
          id: items?.ID,
          category: items?.Category,
        });
      });
      setCategoryDetails([...tempCategoryArray]);
    });
  };

  //Set Actions PopUp:
  const actionsWithIcons = [
    {
      label: "View",
      icon: "pi pi-eye",
      className: "customView",
      command: (event: any) => {},
    },
    {
      label: "Edit",
      icon: "pi pi-file-edit",
      className: "customEdit",
      command: (event: any) => {},
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      className: "customDelete",
      command: (event: any) => {},
    },
  ];

  const renderActionColumn = (rowData: ICategoryDetails) => {
    return <ActionsMenu items={actionsWithIcons} />;
  };

  const handleInputValue = (type: string, value: any) => {
    setCategoryDetailsObj((prev: ICategoryObjDetails) => ({
      ...prev,
      [type]: value,
    }));
  };

  const AddCategoryDetails = () => {
    // const tempcategoryArr: ICategoryDetails[] = [...categoryDetails];
    // tempcategoryArr.unshift({
    //   id: Math.max(...tempcategoryArr.map((o) => o?.id)) + 1,
    //   category: "",
    // });
    // setCategoryDetails([...tempcategoryArr]);
    setVisibleRight(true);
  };

  const generateJson = () => {
    let json: ICategoryObjDetails = {
      Category: categoryDetailsObj?.Category,
    };
    SPServices.SPAddItem({
      Listname: Config.ListNames.CategoryConfig,
      RequestJSON: json,
    }).then(() => {
      getCategoryConfigDetails();
      setVisibleRight(false);
    });
  };

  const validateFunction = () => {
    let isValidation: boolean = !categoryDetailsObj?.Category;
    setIsValidation(isValidation);
    return !isValidation;
  };

  useEffect(() => {
    getCategoryConfigDetails();
  }, []);
  return (
    <>
      <div className="customDataTableContainer">
        <Button icon="pi pi-arrow-left" onClick={() => AddCategoryDetails()} />
        <DataTable
          value={categoryDetails}
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage={
            <>
              <p style={{ textAlign: "center" }}>No Records Found</p>
            </>
          }
        >
          <Column
            style={{ width: "80%" }}
            field="category"
            header="Category"
          ></Column>
          <Column
            style={{ width: "20%" }}
            field="Action"
            body={renderActionColumn}
          ></Column>
        </DataTable>
        <div>
          <Sidebar
            className="CustomSideBarContainer"
            visible={visibleRight}
            position="right"
            onHide={() => setVisibleRight(false)}
          >
            <h4 className={categoryConfigStyles.categorySideBarHeading}>
              Add new category
            </h4>
            <div className={categoryConfigStyles.categoryContainer}>
              <div className={categoryConfigStyles.inputWrapper}>
                <InputText
                  value={categoryDetailsObj?.Category}
                  onChange={(e) => handleInputValue("Category", e.target.value)}
                  style={{ width: "100%" }}
                  placeholder="Enter category"
                />
                {isValidation && !categoryDetailsObj?.Category && (
                  <span className="error_message ">Category is required</span>
                )}
              </div>
              <div
                className={`${categoryConfigStyles.buttonWrapper} customButtonWrapper`}
              >
                <Button
                  style={{ padding: "5px" }}
                  icon="pi pi-plus"
                  className="p-button-success"
                />
              </div>
            </div>
            <div className={`${categoryConfigStyles.sideBarButtonContainer}`}>
              <Button
                icon="pi pi-times"
                label="Cancel"
                className="customCancelButton"
                onClick={() => {
                  setIsValidation(false);
                  setVisibleRight(false);
                }}
              />
              <Button
                icon="pi pi-save"
                label="Submit"
                className="customSubmitButton"
                onClick={() => {
                  if (validateFunction()) {
                    generateJson();
                  }
                }}
              />
            </div>
          </Sidebar>
        </div>
      </div>
    </>
  );
};

export default CategoryConfig;
