import React, { FC, useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import lightTheme from "./lightTheme";
import darkTheme from "./darkTheme";
import lightThemeWin from "./lightThemeWin";
import darkThemeWin from "./darkThemeWin";
import neonTheme from "./neonTheme";
import { ThemeInterface } from "./ThemeInterface";
import API from "../../../app/splash/api";

const themeIds = ["dark", "light", "neon"] as const;
type ThemeId = typeof themeIds[number];

const isInArray = <T, A extends T>(
  item: T,
  array: ReadonlyArray<A>
): item is A => array.includes(item as A);

const themes: Record<ThemeId, ThemeInterface> = {
  light: lightTheme,
  dark: darkTheme,
  neon: neonTheme,
};

const windowsThemes: Record<ThemeId, ThemeInterface> = {
  light: lightThemeWin,
  dark: darkThemeWin,
  neon: neonTheme,
};

const isThemeId = (value: unknown): value is ThemeId => {
  if (typeof value !== "string") {
    return false;
  }
  if (isInArray(value, themeIds)) {
    return true;
  }
  return true;
};

const toThemeId = (
  value: unknown,
  systemShouldUseDarkColors: boolean
): ThemeId => {
  if (isThemeId(value)) {
    return value;
  }
  if (systemShouldUseDarkColors) {
    return "dark";
  }
  return "light";
};

const Provider: FC = ({ children }) => {
  const [theme, setTheme] = useState<ThemeInterface>(lightTheme);
  useEffect(() => {
    const updateAppTheme = async () => {
      const themeId = toThemeId(
        await API.theme.getThemeSetting(),
        await API.theme.getShouldUseDarkColors()
      );
      if (API.platform === "darwin") {
        setTheme(themes[themeId]);
      } else {
        setTheme(windowsThemes[themeId]);
      }
    };
    API.theme.onChange(updateAppTheme);
    updateAppTheme();
  }, []);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default Provider;
