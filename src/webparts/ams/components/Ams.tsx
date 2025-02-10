import * as React from "react";
// import styles from './Ams.module.scss';
import { IAmsProps } from "./IAmsProps";
import { escape } from "@microsoft/sp-lodash-subset";
import { sp } from "@pnp/sp";
import MainComponent from "./MainComponent";

export default class Ams extends React.Component<IAmsProps, {}> {
  constructor(prop: IAmsProps, state: {}) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context,
    });
  }
  public render(): React.ReactElement<IAmsProps> {
    return <MainComponent context={this.props.context} />;
  }
}
