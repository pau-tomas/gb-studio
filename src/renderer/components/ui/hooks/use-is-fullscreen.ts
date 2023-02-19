import { useState, useEffect } from "react";
import API from "renderer/lib/api";

export const useIsFullscreen = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    API.app.onEnterFullScreen(() => setIsFullScreen(true));
    API.app.onLeaveFullScreen(() => setIsFullScreen(false));
  }, []);

  useEffect(() => {
    async function fetch() {
      setIsFullScreen(await API.app.isFullScreen());
    }
    fetch();
  }, []);

  return isFullScreen;
};
