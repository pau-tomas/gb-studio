import React from "react";
import { useDispatch } from "react-redux";
import { customEventSelectors } from "renderer/project/store/features/entities/entitiesState";
import entitiesActions from "renderer/project/store/features/entities/entitiesActions";
import { addBankRef, AssetReference } from "../ReferencesSelect";

interface CustomEventSymbolsEditorProps {
  id: string;
}

export const CustomEventSymbolsEditor = ({
  id,
}: CustomEventSymbolsEditorProps) => {
  const dispatch = useDispatch();
  return (
    <AssetReference
      id={id}
      selector={(state) => customEventSelectors.selectById(state, id)}
      onRename={(symbol) => {
        dispatch(
          entitiesActions.setCustomEventSymbol({
            customEventId: id,
            symbol,
          })
        );
      }}
      copyTransform={addBankRef}
    />
  );
};
