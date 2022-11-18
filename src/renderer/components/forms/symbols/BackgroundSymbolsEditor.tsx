import React from "react";
import { useDispatch } from "react-redux";
import { backgroundSelectors } from "renderer/project/store/features/entities/entitiesState";
import entitiesActions from "renderer/project/store/features/entities/entitiesActions";
import {
  tilesetSymbol,
  tilemapSymbol,
  tilemapAttrSymbol,
} from "lib/helpers/symbols";
import { addBankRef, AssetReference } from "components/forms/ReferencesSelect";

interface BackgroundSymbolsEditorProps {
  id: string;
}

export const BackgroundSymbolsEditor = ({
  id,
}: BackgroundSymbolsEditorProps) => {
  const dispatch = useDispatch();
  return (
    <AssetReference
      id={id}
      selector={(state) => backgroundSelectors.selectById(state, id)}
      onRename={(symbol) => {
        dispatch(
          entitiesActions.setBackgroundSymbol({
            backgroundId: id,
            symbol,
          })
        );
      }}
      copyTransform={addBankRef}
      extraSymbols={(symbol) => [
        tilesetSymbol(symbol),
        tilemapSymbol(symbol),
        tilemapAttrSymbol(symbol),
      ]}
    />
  );
};
