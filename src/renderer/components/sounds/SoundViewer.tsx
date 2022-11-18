import { l10n } from "renderer/lib/api";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Sound } from "renderer/project/store/features/entities/entitiesTypes";
import soundfxActions from "renderer/project/store/features/soundfx/soundfxActions";
import styled from "styled-components";
import { Button } from "renderer/components/ui/buttons/Button";
import { FormContainer } from "renderer/components/ui/form/FormLayout";
import { Input } from "renderer/components/ui/form/Input";
import { Label } from "renderer/components/ui/form/Label";
import { PlayIcon } from "renderer/components/ui/icons/Icons";

interface SoundViewerProps {
  file: Sound;
}

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const SettingsWrapper = styled.div`
  margin-top: 20px;
  background-color: var(--sidebar-border-color);
  border-radius: 8px;
  padding: 10px;
`;

export const SoundViewer = ({ file }: SoundViewerProps) => {
  const dispatch = useDispatch();

  const [effectIndex, setEffectIndex] = useState(0);

  return (
    <Wrapper>
      <Button
        size="large"
        variant="transparent"
        onClick={() => {
          dispatch(
            soundfxActions.playSoundFx({
              effect: file.id,
              effectIndex: effectIndex,
            })
          );
        }}
      >
        <PlayIcon />
      </Button>
      {file.name}

      {file.type === "fxhammer" ? (
        <SettingsWrapper>
          <FormContainer>
            <Label htmlFor="effectIndex">{l10n("FIELD_EFFECT_INDEX")}</Label>
            <Input
              name="effectIndex"
              type="number"
              min={0}
              max={60}
              value={effectIndex ?? 0}
              onChange={(e) => setEffectIndex(parseInt(e.target.value))}
            ></Input>
          </FormContainer>
        </SettingsWrapper>
      ) : (
        ""
      )}
    </Wrapper>
  );
};
