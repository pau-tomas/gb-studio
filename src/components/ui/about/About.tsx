import styled, { css } from "styled-components";

export interface AboutWrapperProps {
  focus: boolean;
}

export const AboutWrapper = styled.div<AboutWrapperProps>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  align-items: center;
  background: ${(props) => props.theme.colors.document.background};
  color: ${(props) => props.theme.colors.text};
  ${(props) =>
    props.focus === false
      ? css`
          opacity: 0.75;
          -webkit-filter: grayscale(100%);
        `
      : ""}
`;

export const AboutTitle = styled.h2`
  cursor: pointer;

  margin: 0px;
  padding-bottom: 10px;
`;

export const AboutDescription = styled.h3`
  margin: 0px;
  padding-bottom: 20px;
`;

export const AboutCopyright = styled.div`
  margin: 0px;
  padding-bottom: 10px;
  font-size: 0.7rem;
  opacity: 0.6;
`;

export const AboutBugReport = styled.div`
  padding-top: 20px;
`;

export const AboutVersions = styled.table`
  font-size: 0.7rem;
  opacity: 0.6;
`;

export const AboutIcon = styled.img`
  max-width: 120px;
  padding-bottom: 10px;
  cursor: pointer;
`;
