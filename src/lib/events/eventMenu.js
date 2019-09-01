import l10n from "../helpers/l10n";

export const id = "EVENT_MENU";

export const fields = [].concat(
  [
    {
      key: "variable",
      type: "variable",
      defaultValue: "LAST_VARIABLE"
    },
    {
      key: "items",
      label: "Number of items",
      type: "number",
      min: 2,
      max: 8,
      defaultValue: 2
    }
  ],
  Array(8)
    .fill()
    .reduce((arr, _, i) => {
      arr.push({
        key: `option${i + 1}`,
        label: l10n("FIELD_SET_TO_VALUE_IF", { value: i + 1 }),
        type: "text",
        maxLength: 6,
        defaultValue: "",
        placeholder: l10n("FIELD_ITEM"),
        conditions: [
          {
            key: "items",
            gt: i
          }
        ]
      });
      return arr;
    }, []),
);

export const compile = (input, helpers) => {
  const { textMenu } = helpers;
  textMenu(input.variable, [input.option1, input.option2, input.option3, input.option4, input.option5, input.option6, input.option7, input.option8].splice(0, input.items), input.false);
};
