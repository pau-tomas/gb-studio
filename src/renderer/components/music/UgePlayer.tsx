// import { ipcRenderer } from "electron";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Song } from "shared/lib/uge/song/Song";
import { RootState } from "renderer/project/store/configureStore";
import trackerActions from "renderer/project/store/features/tracker/trackerActions";

interface UgePlayerProps {
  data: Song | null;
  onChannelStatusUpdate?: (channels: boolean[]) => void;
}

const ipcRenderer = {
  send: (..._a: unknown[]) => {
    console.warn("Implement UgePlayer ipc API");
  },
  on: (..._a: unknown[]) => {
    console.warn("Implement UgePlayer ipc API");
  },
  removeListener: (..._a: unknown[]) => {
    console.warn("Implement UgePlayer ipc API");
  },
};

export const UgePlayer = ({ data, onChannelStatusUpdate }: UgePlayerProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    ipcRenderer.send("open-music");
    return function close() {
      ipcRenderer.send("close-music");
    };
  }, []);

  const play = useSelector((state: RootState) => state.tracker.playing);

  useEffect(() => {
    const listener = (_event: unknown, d: { action: string }) => {
      switch (d.action) {
        case "initialized":
          ipcRenderer.send("music-data-send", {
            action: "load-song",
            song: data,
          });
          break;
        case "loaded":
          dispatch(trackerActions.playerReady(true));
          break;
        case "muted":
          const message = (
            d as { action: "muted"; message: { channels: boolean[] } }
          ).message;
          if (onChannelStatusUpdate) {
            onChannelStatusUpdate(message.channels);
          }
          break;
        case "update":
        case "log":
          break;
        default:
          console.log(`Action ${d.action} not supported`);
      }
    };

    ipcRenderer.on("music-data", listener);

    return () => {
      ipcRenderer.removeListener("music-data", listener);
    };
  }, [onChannelStatusUpdate, play, data, dispatch]);

  useEffect(() => {
    if (play) {
      console.log("PLAY");
      ipcRenderer.send("music-data-send", {
        action: "play",
        song: data,
      });
    } else {
      ipcRenderer.send("music-data-send", {
        action: "stop",
      });
    }
  }, [play, data]);

  return <div />;
};
