import React, { useEffect, useState } from "react";
import ThemeProvider from "ui/theme/ThemeProvider";
import GlobalStyle from "ui/globalStyle";
import { PreferencesWrapper } from "ui/preferences/Preferences";
import { FormField, FormRow } from "ui/form/FormLayout";
import { TextField } from "ui/form/TextField";
import { Button } from "ui/buttons/Button";
import { DotsIcon } from "ui/icons/Icons";
import { FixedSpacer, FlexGrow } from "ui/spacing/Spacing";
import { AppSelect } from "ui/form/AppSelect";
import { OptionLabelWithInfo, Select } from "ui/form/Select";
import { app, paths, settings, dialog } from "renderer/lib/api";
import { SkeletonInput } from "ui/skeleton/Skeleton";
import l10n from "shared/lib/l10n";

interface Options {
  value: number;
  label: string;
}

// ZoomLevel scale := 1.2 ^ level
const zoomOptions: Options[] = [
  { value: -3.80178, label: `50%` },
  { value: -3, label: `58%` },
  { value: -2, label: `69%` },
  { value: -1, label: `83%` },
  { value: 0, label: `100%` },
  { value: 1, label: `120%` },
  { value: 2.2239, label: `150%` },
  { value: 3, label: `172%` },
  { value: 3.80178, label: `200%` },
];

const trackerKeyBindingsOptions: Options[] = [
  { value: 0, label: l10n("FIELD_UI_LINEAR") },
  { value: 1, label: l10n("FIELD_UI_PIANO") },
];

const trackerKeyBindingsOptionsInfo: string[] = [
  l10n("FIELD_UI_LINEAR_INFO"),
  l10n("FIELD_UI_PIANO_INFO"),
];

const getTmp = () => paths.getTmpPath();

const Preferences = () => {
  const pathError = "";
  const [loading, setLoading] = useState(true);
  const [tmpPath, setTmpPath] = useState<string>("");
  const [imageEditorPath, setImageEditorPath] = useState<string>("");
  const [musicEditorPath, setMusicEditorPath] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [trackerKeyBindings, setTrackerKeyBindings] = useState<number>(0);

  const currentZoomValue = zoomOptions.find((o) => o.value === zoomLevel);

  const currentTrackerKeyBindings = trackerKeyBindingsOptions.find(
    (o) => o.value === trackerKeyBindings
  );

  useEffect(() => {
    async function fetchData() {
      setTmpPath(await getTmp());
      setImageEditorPath(String((await settings.get("imageEditorPath")) || ""));
      setMusicEditorPath(String((await settings.get("musicEditorPath")) || ""));
      setZoomLevel(Number((await settings.get("zoomLevel")) || 0));
      setTrackerKeyBindings(
        Number((await settings.get("trackerKeyBindings")) || 0)
      );
      setLoading(false);
    }
    fetchData();
  }, []);

  const onChangeTmpPath = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.currentTarget.value;
    setTmpPath(newPath);
    await settings.set("tmpDir", newPath);
  };

  const onChangeImageEditorPath = async (path: string) => {
    setImageEditorPath(path);
    await settings.set("imageEditorPath", path);
  };

  const onChangeMusicEditorPath = async (path: string) => {
    setMusicEditorPath(path);
    await settings.set("musicEditorPath", path);
  };

  const onChangeZoomLevel = async (zoomLevel: number) => {
    setZoomLevel(zoomLevel);
    app.setUIScale(zoomLevel);
  };

  const onChangeTrackerKeyBindings = async (trackerKeyBindings: number) => {
    setTrackerKeyBindings(trackerKeyBindings);
    app.setTrackerKeyBindings(trackerKeyBindings);
  };

  const onSelectTmpFolder = async () => {
    const directory = await dialog.chooseDirectory();
    if (directory) {
      setTmpPath(directory);
      await settings.set("tmpDir", directory);
    }
  };

  const onRestoreDefaultTmpPath = async () => {
    await settings.delete("tmpDir");
    setTmpPath(await getTmp());
  };

  return (
    <ThemeProvider>
      <GlobalStyle />

      <PreferencesWrapper>
        <FormRow>
          <TextField
            name="path"
            label={l10n("FIELD_TMP_DIRECTORY")}
            errorLabel={pathError}
            value={tmpPath}
            onChange={onChangeTmpPath}
            additionalRight={
              <Button onClick={onSelectTmpFolder} type="button">
                <DotsIcon />
              </Button>
            }
            info={l10n("FIELD_TMP_DIRECTORY_INFO")}
          />
        </FormRow>
        <FormRow>
          <Button onClick={onRestoreDefaultTmpPath}>
            {l10n("FIELD_RESTORE_DEFAULT")}
          </Button>
        </FormRow>

        <FlexGrow />

        <FormRow>
          <FormField
            name="musicEditorPath"
            label={l10n("FIELD_DEFAULT_IMAGE_EDITOR")}
          >
            {loading ? (
              <SkeletonInput />
            ) : (
              <AppSelect
                value={imageEditorPath}
                onChange={onChangeImageEditorPath}
              />
            )}
          </FormField>
          <FormField
            name="musicEditorPath"
            label={l10n("FIELD_DEFAULT_MUSIC_EDITOR")}
          >
            {loading ? (
              <SkeletonInput />
            ) : (
              <AppSelect
                value={musicEditorPath}
                onChange={onChangeMusicEditorPath}
              />
            )}
          </FormField>
        </FormRow>

        <FixedSpacer height={10} />
        <FormRow>
          <FormField name="zoomLevel" label={l10n("FIELD_UI_ELEMENTS_SCALING")}>
            {loading ? (
              <SkeletonInput />
            ) : (
              <Select
                value={currentZoomValue}
                options={zoomOptions}
                onChange={(newValue: Options) => {
                  onChangeZoomLevel(newValue.value);
                }}
              />
            )}
          </FormField>
        </FormRow>
        <FixedSpacer height={10} />
        <FormRow>
          <FormField
            name="trackerKeyBindings"
            label={l10n("FIELD_UI_TRACKER_KEYBINDINGS")}
          >
            {loading ? (
              <SkeletonInput />
            ) : (
              <Select
                value={currentTrackerKeyBindings}
                options={trackerKeyBindingsOptions}
                onChange={(newValue: Options) => {
                  onChangeTrackerKeyBindings(newValue.value);
                }}
                formatOptionLabel={(
                  option: Options,
                  { context }: { context: "menu" | "value" }
                ) => {
                  return (
                    <OptionLabelWithInfo
                      info={
                        context === "menu"
                          ? trackerKeyBindingsOptionsInfo[option.value]
                          : ""
                      }
                    >
                      {option.label}
                      {context === "value"
                        ? ` (${trackerKeyBindingsOptionsInfo[option.value]})`
                        : ""}
                    </OptionLabelWithInfo>
                  );
                }}
              />
            )}
          </FormField>
        </FormRow>
      </PreferencesWrapper>
    </ThemeProvider>
  );
};

export default Preferences;
