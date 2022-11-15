import React from "react";
import { l10n } from "renderer/lib/api";
import "./LoadingPane.css";

const LoadingPane = () => (
  <div className="LoadingPane">
    <div className="LoadingPane__Content">{l10n("FIELD_LOADING")}</div>
  </div>
);

export default LoadingPane;
