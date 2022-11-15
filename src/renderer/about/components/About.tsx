import React, { useEffect, useState } from "react";
import ThemeProvider from "ui/theme/ThemeProvider";
import GlobalStyle from "ui/globalStyle";
import {
  AboutTitle,
  AboutDescription,
  AboutIcon,
  AboutWrapper,
  AboutCopyright,
  AboutBugReport,
  AboutVersions,
} from "ui/about/About";
import appIcon from "../../../assets/app/icon/app_icon.png";
import API, { l10n } from "renderer/lib/api";
import { Button } from "ui/buttons/Button";
import { FlexGrow } from "ui/spacing/Spacing";
import useWindowFocus from "ui/hooks/use-window-focus";

interface AboutInfo {
  name: string;
  version: string;
  homepage: string;
  bugReportUrl: string;
  commitHash: string;
}

const processNames = ["electron", "chrome", "node", "v8"] as const;

const About = () => {
  const [info, setInfo] = useState<AboutInfo>();
  const windowFocus = useWindowFocus();

  useEffect(() => {
    async function fetchData() {
      setInfo(await API.app.getInfo());
    }
    fetchData();
  }, []);

  return (
    <ThemeProvider>
      <GlobalStyle />
      <AboutWrapper focus={windowFocus}>
        {info && (
          <>
            <AboutIcon
              src={appIcon}
              title={info.name}
              onClick={() => API.openExternal(info.homepage)}
            />
            <AboutTitle onClick={() => API.openExternal(info.homepage)}>
              {info.name} {info.version}
            </AboutTitle>
            <AboutDescription>{l10n("GBSTUDIO_DESCRIPTION")}</AboutDescription>
            <AboutCopyright>{l10n("GBSTUDIO_COPYRIGHT")}</AboutCopyright>
            <AboutVersions>
              <tbody>
                {processNames.map((processName) => (
                  <tr key={processName}>
                    <td>{processName}</td>
                    <td>: {API.app.processVersions[processName]}</td>
                  </tr>
                ))}
                <tr>
                  <td>commit</td>
                  <td>: {info.commitHash}</td>
                </tr>
              </tbody>
            </AboutVersions>
            <FlexGrow />

            <AboutBugReport>
              <Button
                size="small"
                onClick={() => API.openExternal(info.bugReportUrl)}
              >
                {l10n("FIELD_REPORT_BUG")}
              </Button>
            </AboutBugReport>
          </>
        )}
      </AboutWrapper>
    </ThemeProvider>
  );
};

export default About;
