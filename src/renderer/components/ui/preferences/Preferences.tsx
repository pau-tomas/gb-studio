import styled from "styled-components";

export const PreferencesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  background: ${(props) => props.theme.colors.document.background};
  color: ${(props) => props.theme.colors.text};
`;
