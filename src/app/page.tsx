"use client";

import { useDraw } from "@/hooks/useDraw";
import { FC, useState } from "react";
import { ChromePicker } from "react-color";
import rgbHex from "rgb-hex";

interface pageProps {}

const Page: FC<pageProps> = ({}) => {
  const { canvasRef, onMouseDown, clear, currentCoords } = useDraw(drawLine);
  const [color, setColor] = useState<string>("#000");
  const [width, setWidth] = useState<number>(4);

  function drawLine({ prevPoint, currentPoint, ctx }: Draw) {
    const { x: currX, y: currY } = currentPoint;
    const lineColor = color;
    const lineWidth = width;

    let startPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }
  return (
    <div className="flex w-full h-screen justify-center items-center gap-x-4">
      <div className="flex flex-col gap-y-4">
        <div
          draggable
          style={{
            position: "absolute",
            top: currentCoords?.clientY,
            left: currentCoords?.clientX,
            pointerEvents: "none",
            padding: width / 2 + "px",
            zIndex: "1",
            backgroundColor: color,
          }}
          className="rounded-full bg-black transform translate-x-[-50%] translate-y-[-50%]"
        />
        <ChromePicker
          color={color}
          onChange={(e) =>
            setColor("#" + rgbHex(e.rgb.r, e.rgb.g, e.rgb.b, e.rgb.a))
          }
        />
        <button onClick={clear}>Clear</button>
        <div className="flex gap-x-4">
          {[4, 8, 16, 32].map((widthOption) => (
            <button
              key={widthOption}
              onClick={() => setWidth(widthOption)}
              className={`rounded-md w-full ${
                widthOption === width
                  ? "bg-purple-500 !text-white"
                  : "bg-white border border-black"
              }`}
            >
              {widthOption}
            </button>
          ))}
        </div>
      </div>
      <canvas
        style={{
          cursor: "none",
          overflow: "hidden",
        }}
        onMouseDown={onMouseDown}
        ref={canvasRef}
        height={750}
        width={750}
        className="border border-black"
      />
    </div>
  );
};

export default Page;
