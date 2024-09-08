import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";

const GameStates = ["idle", "ready", "play", "finish"] as const;
export type RenderMode = "html" | "webgl";
export type GameState = (typeof GameStates)[number];
export type ControlInputs = {
  left?: boolean;
  right?: boolean;
  down?: boolean;
  rotate?: boolean;
  drop?: boolean;
};

export type useTetrisProps = {
  start?: boolean;
  controlInputs?: ControlInputs;
  renderMode?: RenderMode;
};
const defaultUseTetrisProps: Partial<useTetrisProps> = {
  renderMode: "html",
};

export type TetrisProps = {
  gameState: GameState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  renderMode: RenderMode;
};

// 10 * 20
const DefaultMap = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

type Block = {
  shape: number[][];
  center: { x: number; y: number }; //rotation center
};

const Blocks: Block[] = [
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    center: { x: 1, y: 1 },
  },
  {
    shape: [[1, 1, 1, 1]],
    center: { x: 1, y: 0 },
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    center: { x: 1, y: 0 },
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    center: { x: 1, y: 1 },
  },
  {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    center: { x: 1, y: 0 },
  },
  {
    shape: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    center: { x: 1, y: 1 },
  },
  {
    shape: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    center: { x: 1, y: 1 },
  },
];

export const useTetris = ({
  start,
  controlInputs,
  renderMode,
}: useTetrisProps = {}): TetrisProps => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentMap = useRef([...DefaultMap]);

  const renderCanvas = () => {
    const theCanvas = canvasRef.current;
    if (!theCanvas) {
      return;
    }
    const ctx = theCanvas.getContext("2d");
    if (!ctx) {
      alert("2d context is not supported");
      return;
    }

    const render = () => {
      requestAnimationFrame(render);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, theCanvas.width, theCanvas.height);
    };

    const id = requestAnimationFrame(() => {
      render();
    });

    return () => {
      cancelAnimationFrame(id);
    };
  };

  const renderHTML = () => {};

  useEffect(() => {
    if (!start) {
      return;
    }

    let retval = null;
    if (renderMode === "webgl") {
      retval = renderCanvas();
    } else {
      retval = renderHTML();
    }

    return retval;
  }, [start, renderMode]);

  return {
    gameState,
    canvasRef,
    renderMode: renderMode ?? "html",
  };
};

function TheTetris({ canvasRef, gameState, renderMode }: TetrisProps) {
  return (
    <CanvasWrapper>
      {renderMode === "webgl" ? (
        <TheCanvas ref={canvasRef}></TheCanvas>
      ) : (
        <TheHTMLGameContainer></TheHTMLGameContainer>
      )}
    </CanvasWrapper>
  );
}

const CanvasWrapper = styled.div`
  max-width: 700px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const TheCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const TheHTMLGameContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: black;
`;

export default TheTetris;
