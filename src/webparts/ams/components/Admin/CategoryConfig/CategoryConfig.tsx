//Default Imports:
import * as React from "react";
import { useState, useEffect, useRef } from "react";
//Common Service Imports:
import SPServices from "../../../../../CommonServices/SPServices";
import { Config } from "../../../../../CommonServices/Config";
import {
  IActionBooleans,
  ICategoryDetails,
} from "../../../../../CommonServices/interface";
//Styles Imports:
import "../../../../../External/style.css";
import categoryConfigStyles from "../CategoryConfig.module.scss";
//primeReact Imports:
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";

const CategoryConfig = () => {
  const menuLeft = useRef(null);
  const [categoryDetails, setCategoryDetails] = useState<ICategoryDetails[]>(
    []
  );
  const [visibleRight, setVisibleRight] = useState<boolean>(false);
  const [categoryInputs, setCategoryInputs] = useState<string[]>([""]);
  console.log(categoryInputs, "categoryInputs");
  const [categoryIndex, setCategoryIndex] = useState<number>(null);
  const [actionsBooleans, setActionsBooleans] = useState<IActionBooleans>({
    ...Config.InitialActionsBooleans,
  });
  console.log(categoryIndex, "categoryIndex");

  const getCategoryConfigDetails = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryConfig,
      Orderby: "Modified",
      Orderbydecorasc: false,
      Select: "*",
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "eq",
          FilterValue: "false",
        },
      ],
    }).then((res: any) => {
      const tempCategoryArray: ICategoryDetails[] = [];
      res.forEach((items: any) => {
        tempCategoryArray.push({
          id: items?.ID,
          category: items?.Category,
          isDelete: items?.IsDelete,
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
      command: (event: any) => {
        handleViewCategory(
          categoryDetails.find((item: any) => item.id === categoryIndex)
        );
      },
    },
    {
      label: "Edit",
      icon: "pi pi-file-edit",
      className: "customEdit",
      command: (event: any) => {
        handleEditCategory(
          categoryDetails.find((item: any) => item.id === categoryIndex)
        );
      },
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      className: "customDelete",
      command: (event: any) => {
        hanldeDeleteCategory();
      },
    },
  ];

  const handleViewCategory = (rowData: ICategoryDetails) => {
    setActionsBooleans((prev) => ({
      ...prev,
      isView: true,
    }));
    setCategoryInputs([rowData.category]);
    setCategoryIndex(rowData.id);
    setVisibleRight(true);
  };

  const handleEditCategory = (rowData: ICategoryDetails) => {
    setActionsBooleans((prev) => ({
      ...prev,
      isEdit: true,
    }));
    setCategoryInputs([rowData.category]);
    setCategoryIndex(rowData.id);
    setVisibleRight(true);
  };

  const hanldeDeleteCategory = () => {
    const currObj = {
      IsDelete: true,
    };
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CategoryConfig,
      ID: categoryIndex,
      RequestJSON: currObj,
    })
      .then((res) => {
        getCategoryConfigDetails();
      })
      .catch((err) => {
        console.log("Delete Category Error", err);
      });
  };

  const renderActionColumn = (rowData: ICategoryDetails) => {
    return (
      <div className="customActionMenu">
        <Menu
          model={actionsWithIcons}
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
            setCategoryIndex(rowData?.id);
          }}
          aria-controls="popup_menu_left"
          aria-haspopup
        />
      </div>
    );
  };

  const handleCategoryChange = (index: number, value: string) => {
    const updatedInputs = [...categoryInputs];
    updatedInputs[index] = value;
    setCategoryInputs(updatedInputs);
  };

  const removeCategoryInput = (index: number) => {
    const updatedInputs = categoryInputs.filter((_, i) => i !== index);
    setCategoryInputs(updatedInputs);
  };

  const addCategoryInput = () => {
    let DataEmptyCheck = categoryInputs[categoryInputs.length - 1];
    if (DataEmptyCheck) {
      setCategoryInputs([...categoryInputs, ""]);
    }
  };

  const submitCategories = () => {
    const validCategories = categoryInputs.filter(
      (category) => category !== ""
    );
    if (validCategories.length > 0) {
      if (actionsBooleans?.isEdit) {
        // Update the existing category
        SPServices.SPUpdateItem({
          Listname: Config.ListNames.CategoryConfig,
          ID: categoryIndex,
          RequestJSON: { Category: validCategories[0] },
        })
          .then(() => {
            getCategoryConfigDetails();
            setVisibleRight(false);
            setCategoryInputs([""]);
            setCategoryIndex(null);
            setActionsBooleans((prev) => ({
              ...prev,
              isEdit: false,
            }));
          })
          .catch((err) => console.log("Update Category Error", err));
      } else {
        // Add a new category
        const jsonArray = validCategories.map((item: string) => ({
          Category: item,
        }));
        jsonArray.forEach((json) => {
          SPServices.SPAddItem({
            Listname: Config.ListNames.CategoryConfig,
            RequestJSON: json,
          }).then(() => {
            getCategoryConfigDetails();
            setVisibleRight(false);
            setCategoryInputs([""]);
          });
        });
      }
    }
  };

  useEffect(() => {
    getCategoryConfigDetails();
  }, []);
  return (
    <>
      <div className="customDataTableContainer">
        <Button icon="pi pi-arrow-left" onClick={() => setVisibleRight(true)} />
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
              {categoryInputs.map((input, index) => (
                <div key={index} className={categoryConfigStyles.inputWrapper}>
                  <InputText
                    disabled={actionsBooleans?.isView}
                    value={input}
                    onChange={(e) =>
                      handleCategoryChange(index, e.target.value)
                    }
                    style={{ width: "100%" }}
                    placeholder="Enter category"
                  />
                  {index !== categoryInputs.length - 1 && (
                    <Button
                      icon="pi pi-trash"
                      className="p-button-danger"
                      onClick={() => removeCategoryInput(index)}
                    />
                  )}
                </div>
              ))}
              <div
                className={`${categoryConfigStyles.buttonWrapper} customButtonWrapper`}
              >
                <Button
                  style={{ padding: "5px" }}
                  icon="pi pi-plus"
                  disabled={actionsBooleans?.isEdit || actionsBooleans?.isView}
                  className="p-button-success"
                  onClick={() => addCategoryInput()}
                />
              </div>
            </div>

            <div className={`${categoryConfigStyles.sideBarButtonContainer}`}>
              <Button
                icon="pi pi-times"
                label="Cancel"
                className="customCancelButton"
                onClick={() => {
                  setVisibleRight(false);
                  setCategoryInputs([""]);
                  setActionsBooleans({
                    isEdit: false,
                    isView: false,
                  });
                }}
              />
              {!actionsBooleans?.isView && (
                <Button
                  icon="pi pi-save"
                  label="Submit"
                  className="customSubmitButton"
                  onClick={submitCategories}
                />
              )}
            </div>
          </Sidebar>
        </div>
      </div>
    </>
  );
};

export default CategoryConfig;
