import React from "react";
import { useDispatch } from "react-redux";
import { spriteSheetSelectors } from "renderer/project/store/features/entities/entitiesState";
import entitiesActions from "renderer/project/store/features/entities/entitiesActions";
import { tilesetSymbol } from "lib/helpers/symbols";
import { addBankRef, AssetReference } from "../ReferencesSelect";

interface SpriteSymbolsEditorProps {
  id: string;
}

export const SpriteSymbolsEditor = ({ id }: SpriteSymbolsEditorProps) => {
  const dispatch = useDispatch();
  return (
    <AssetReference
      id={id}
      selector={(state) => spriteSheetSelectors.selectById(state, id)}
      onRename={(symbol) => {
        dispatch(
          entitiesActions.setSpriteSheetSymbol({
            spriteSheetId: id,
            symbol,
          })
        );
      }}
      copyTransform={addBankRef}
      extraSymbols={(symbol) => [tilesetSymbol(symbol)]}
    />
  );
};
