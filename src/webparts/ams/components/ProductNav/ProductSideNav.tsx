//Default Imports:
import * as React from "react";
import { useEffect, useState } from "react";
//Styles Imports:
import sideNavStyles from "./ProductSideNav.module.scss";
//CommonService Imports:
import { ISideNavDetails } from "../../../../CommonServices/interface";
//Fluentui Imports:
import { TooltipHost } from "@fluentui/react";

const ProductSideNav = ({ updatePage, currentPage }) => {
  //Image Variables:
  const sampleImg: any = require("../../../../External/sidenavImages/sampleImg.png");
  const sampleImgBlue: any = require("../../../../External/sidenavImages/sampleImgBlue.png");

  //Get SideNav Details:
  const sideNavContents: ISideNavDetails[] = [];
  sideNavContents.push(
    {
      img: currentPage == "Dashboard" ? sampleImg : sampleImgBlue,
      name: "Dashboard",
      pageName: "Dashboard",
    },
    {
      img: currentPage == "Order" ? sampleImg : sampleImgBlue,
      name: "Order",
      pageName: "Order",
    },
    {
      img: currentPage == "Messages" ? sampleImg : sampleImgBlue,
      name: "Messages",
      pageName: "Messages",
    }
  );

  //SetPagename :
  const updatePageUrl = (pageName: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("Page", pageName);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}${
      window.location.hash
    }`;
    history.pushState(null, "", newUrl);
    updatePage(pageName);
  };

  return (
    <>
      <div>
        {sideNavContents?.map((contents, index) => {
          return (
            <div key={index}>
              <TooltipHost
                content={contents.name}
                calloutProps={{ gapSpace: 0 }}
              >
                <div
                  onClick={() => {
                    updatePageUrl(contents.pageName);
                  }}
                  className={
                    contents?.pageName === currentPage
                      ? sideNavStyles.navButtonActiveContainer
                      : sideNavStyles.navButtonInactiveContainer
                  }
                >
                  <div className={sideNavStyles.iconSection}>
                    <img src={contents?.img}></img>
                  </div>
                  <div className={sideNavStyles.labelSection}>
                    {contents?.name}
                  </div>
                </div>
              </TooltipHost>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductSideNav;
