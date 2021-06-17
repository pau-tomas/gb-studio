import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { ValueType, ActionMeta } from "react-select";
import { Select } from "../ui/form/Select";
import l10n from "../../lib/helpers/l10n";
import { RootState } from "../../store/configureStore";
import { FormRow, FormField } from "../ui/form/FormLayout";

interface VolumeEnvelopeFormProps {
  volume: number,
  volume_sweep_change: number,
  length: number,
  onChange: (value: ValueType<any>, actionMeta: ActionMeta<any>) => void;
}

export const VolumeEnvelopeForm = ({
  volume,
  volume_sweep_change,
  length,
  onChange
}: VolumeEnvelopeFormProps) => {

  const song = useSelector((state: RootState) =>
    state.trackerDocument.present.song
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!song) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
  
    const drawWidth = canvas.width - 10;
    const drawHeight = canvas.height - 10;
    const ctx = canvas.getContext("2d");

    const defaultColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--highlight-color");

    canvas.width = canvas.clientWidth;

    if (ctx) {

      const normalisedVolume = volume / 15;
      const secLength = length ? length / 64 / 2 : 1;

      ctx.strokeStyle = defaultColor;
      ctx.lineWidth = 2;

      ctx.moveTo(5, canvas.height - 5 - (normalisedVolume * drawHeight));

      let envelope = volume_sweep_change;
      if (envelope < 0) { //fade down
        envelope = envelope + 8;
        var envLength = (envelope / 64 * volume) / 2;
        ctx.lineTo(5 + Math.min(envLength, secLength) * drawWidth,
        drawHeight + 5 - (1 - Math.min(secLength / envLength, 1)) * normalisedVolume * drawHeight ); 
        ctx.lineTo(5 + secLength * drawWidth, canvas.height - 5);
      }
      else if (envelope > 0) { //fade up
        envelope = 8 - envelope;
        var envLength = (envelope / 64 * (15 - volume)) / 2;
        ctx.lineTo(5 + Math.min(envLength, secLength) * drawWidth, 
        (1 - Math.min(secLength / envLength, 1) ) * drawHeight + 5);
        ctx.lineTo(5 + secLength * drawWidth, (1 - Math.min(secLength / envLength, 1) ) * drawHeight + 5);
      } else { //no fade
        ctx.lineTo(5 + secLength * drawWidth, canvas.height - 5 - (normalisedVolume * drawHeight));        
      }
      ctx.lineTo(5 + (secLength * drawWidth), canvas.height - 5);
      if (secLength < 1) {
        ctx.lineTo(5 + drawWidth, canvas.height - 5);
      }
      ctx.stroke();
    }
  });

  return (
    <>
      <FormRow>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "65px",
            backgroundColor: "#000",
            borderRadius: 4,
          }}
          height={65}
        />
      </FormRow>
    </>
  );
}
