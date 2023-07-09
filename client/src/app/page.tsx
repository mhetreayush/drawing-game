"use client";

import { useDraw } from "@/hooks/useDraw";
import { FC, useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import rgbHex from "rgb-hex";
import { io } from "socket.io-client";
import { drawLine } from "../../utils/drawLine";
const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);
interface pageProps {}
type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
  width: number;
};
const Page: FC<pageProps> = ({}) => {
  const { canvasRef, onMouseDown, clear, currentCoords } = useDraw(createLine);
  const [color, setColor] = useState<string>("#000");
  const [width, setWidth] = useState<number>(4);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    socket.emit("client-ready");

    socket.on("get-canvas-state", () => {
      if (!canvasRef.current?.toDataURL()) return;
      socket.emit("canvas-state", canvasRef.current.toDataURL());
    });

    socket.on("canvas-state-from-server", (state: string) => {
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });
    socket.on(
      "draw-line",
      ({ prevPoint, currentPoint, color, width }: DrawLineProps) => {
        if (!ctx) return;
        console.log(prevPoint, currentPoint, color, width);
        drawLine({ prevPoint, currentPoint, ctx, color, width });
      }
    );

    socket.on("clear", clear);
    return () => {
      socket.off("canvas-state-from-server");
      socket.off("draw-line");
      socket.off("get-canvas-state");
      socket.off("clear");
    };
  }, [canvasRef]);
  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    // console.log(prevPoint, currentPoint, ctx);
    socket.emit("draw-line", { prevPoint, currentPoint, color, width });
    drawLine({ prevPoint, currentPoint, ctx, color, width });
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
        <button
          onClick={() => {
            socket.emit("clear");
          }}
        >
          Clear
        </button>
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
