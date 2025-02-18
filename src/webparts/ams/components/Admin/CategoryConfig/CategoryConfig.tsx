//Default Imports:
import * as React from "react";
import { useState, useEffect } from "react";
//Common Service Imports:
import SPServices from "../../../../../CommonServices/SPServices";
import { Config } from "../../../../../CommonServices/Config";
import { ICategoryDetails } from "../../../../../CommonServices/interface";
//primeReact Imports:
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ActionsMenu } from "../../../../../CommonServices/CommonTemplates";

const CategoryConfig = () => {
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
  const [categoryDetails, setCategoryDetails] = useState<ICategoryDetails[]>(
    []
  );
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

  const renderActionColumn = (rowData: ICategoryDetails) => {
    return <ActionsMenu items={actionsWithIcons} />;
  };

  useEffect(() => {
    getCategoryConfigDetails();
  }, []);
  return (
    <>
      <div className="customDataTableContainer">
        <DataTable
          value={categoryDetails}
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage={
            <>
              <p style={{ textAlign: "center" }}>No Records Found</p>
            </>
          }
        >
          <Column field="category" header="Category"></Column>
          <Column field="Action" body={renderActionColumn}></Column>
        </DataTable>
      </div>
    </>
  );
};

export default CategoryConfig;
