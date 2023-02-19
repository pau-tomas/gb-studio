import { ReactNode } from "react";
import styled, { css } from "styled-components";
import { Button } from "ui/buttons/Button";

export interface ToolbarProps {
  readonly children?: ReactNode;
  readonly focus?: boolean;
  readonly fullScreen?: boolean;
  readonly platform?: string;
}

export const Toolbar = styled.div<ToolbarProps>`
  display: flex;
  box-sizing: border-box;
  height: 38px;
  font-size: ${(props) => props.theme.typography.toolbarFontSize};
  flex-shrink: 0;
  background: ${(props) => props.theme.colors.toolbar.background};
  color: ${(props) => props.theme.colors.text};
  border-bottom: 1px solid ${(props) => props.theme.colors.toolbar.border};
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  user-select: none;
  z-index: 1;
  -webkit-app-region: drag;
  position: relative;
  z-index: 1000;

  & > *:not(:last-child) {
    margin-right: 5px;
  }

  ${Button} {
    -webkit-app-region: no-drag;
    border: 1px solid ${(props) => props.theme.colors.button.toolbar.border};
    border-top: 1px solid
      ${(props) => props.theme.colors.button.toolbar.borderTop};
    height: 26px;
    padding: 0px 10px;
    flex-shrink: 0;
    font-size: 13px;

    svg {
      width: 17px;
      height: 17px;
    }
  }

  ${(props) => (props.focus === false ? blurStyles : "")}
  ${(props) =>
    props.platform === "darwin" && !props.fullScreen ? darwinOffset : ""}
`;

const blurStyles = css`
  background: ${(props) => props.theme.colors.toolbar.inactiveBackground};
  opacity: 0.5;
`;

const darwinOffset = css`
  padding-left: 80px;
`;

export const ToolbarText = styled.div`
  text-shadow: ${(props) => props.theme.colors.toolbar.textShadow};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
