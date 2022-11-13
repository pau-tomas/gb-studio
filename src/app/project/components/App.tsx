import React, { useCallback, useEffect, useRef, useState } from "react";
import projectActions from "project/store/features/project/projectActions";
import cx from "classnames";
import AppToolbar from "components/app/AppToolbar";
import BackgroundsPage from "./pages/BackgroundsPage";
import SpritesPage from "./pages/SpritesPage";
import DialoguePage from "./pages/DialoguePage";
import BuildPage from "./pages/BuildPage";
import WorldPage from "./pages/WorldPage";
import MusicPage from "./pages/MusicPage";
import PalettePage from "./pages/PalettePage";
import SettingsPage from "./pages/SettingsPage";
import { l10n } from "lib/renderer/api";
import LoadingPane from "components/library/LoadingPane";
import { DropZone } from "ui/upload/DropZone";
import SoundsPage from "./pages/SoundsPage";
import { useAppDispatch, useAppSelector } from "project/store/hooks";
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
  const dragLeaveTimer = useRef<number>();

  const onBlur = useCallback(() => {
    setBlur(true);
  }, []);
  const onFocus = useCallback(() => {
    setBlur(false);
  }, []);
  const onDragOver = useCallback((e: DragEvent) => {
    // Don't activate dropzone unless dragging a file
    const types = e.dataTransfer?.types;
    if (!types || types.indexOf("Files") === -1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(dragLeaveTimer.current);
    setDraggingOver(true);
  }, []);
  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(dragLeaveTimer.current);
    dragLeaveTimer.current = setTimeout(() => {
      setDraggingOver(false);
    }, 100);
  }, []);
  const onDrop = useCallback(
    (e: DragEvent) => {
      setDraggingOver(false);
      if (e.dataTransfer) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          dispatch(projectActions.addFileToProject(file.path));
        }
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (projectPath) {
      dispatch(projectActions.loadProject(projectPath));
    }
  }, [dispatch, projectPath]);

  useEffect(() => {
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("resize", onFocus);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("resize", onFocus);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

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
