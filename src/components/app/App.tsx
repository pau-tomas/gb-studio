import React, { useEffect, useState } from "react";
import projectActions from "store/features/project/projectActions";
import cx from "classnames";
import AppToolbar from "./AppToolbar";
import BackgroundsPage from "../pages/BackgroundsPage";
import SpritesPage from "../pages/SpritesPage";
import DialoguePage from "../pages/DialoguePage";
import BuildPage from "../pages/BuildPage";
import WorldPage from "../pages/WorldPage";
import MusicPage from "../pages/MusicPage";
import PalettePage from "../pages/PalettePage";
import SettingsPage from "../pages/SettingsPage";
import { l10n } from "lib/renderer/api";
import LoadingPane from "../library/LoadingPane";
import { DropZone } from "ui/upload/DropZone";
import SoundsPage from "components/pages/SoundsPage";
import { useAppDispatch, useAppSelector } from "store/hooks";
import GlobalError from "components/library/GlobalError";

interface AppProps {
  projectPath?: string;
}

const App = ({ projectPath }: AppProps) => {
  const dispatch = useAppDispatch();
  const loaded = useAppSelector((state) => state.document.loaded);
  const section = useAppSelector((state) => state.navigation.section);
  const [blur, setBlur] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const error = useAppSelector((state) => state.error);

  useEffect(() => {
    if (projectPath) {
      dispatch(projectActions.loadProject(projectPath));
    }
  }, [dispatch, projectPath]);

  if (error.visible) {
    return <GlobalError error={error} />;
  }

  return (
    <div
      className={cx("App", {
        "App--Blur": blur,
        "App--RTL": String(l10n("RTL")) === "true",
      })}
    >
      <AppToolbar />
      {!loaded ? (
        <LoadingPane />
      ) : (
        <div className="App__Content">
          {section === "world" && <WorldPage />}
          {section === "backgrounds" && <BackgroundsPage />}
          {section === "sprites" && <SpritesPage />}
          {section === "music" && <MusicPage />}
          {section === "sounds" && <SoundsPage />}
          {section === "palettes" && <PalettePage />}
          {section === "dialogue" && <DialoguePage />}
          {section === "build" && <BuildPage />}
          {section === "settings" && <SettingsPage />}
          {draggingOver && <DropZone />}
        </div>
      )}
    </div>
  );
};

export default App;
