import styled from "@emotion/styled";
import { init } from "next/dist/compiled/webpack/webpack";
import React, { useCallback, useEffect, useRef, useState } from "react";

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

const vertexShaderSource = /*glsl */ `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  void main() {
    // Convert the rectangle positions from pixel space to clip space
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`;

const fragmentShaderSource = /*glsl */ `
  precision mediump float;
  uniform vec4 u_color;
  void main() {
    // gl_FragColor = u_color;
    gl_FragColor = vec4(1, 0, 0, 1);
  }
`;

class TheProgram {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  // locations: Map<string, WebGLUniformLocation> = new Map();
  locations: Map<"position" | "resolution" | "color", WebGLUniformLocation> =
    new Map();

  constructor(canvas?: HTMLCanvasElement) {
    if (!canvas) {
      throw new Error("canvas is not provided");
    }
    this.canvas = canvas;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      throw new Error("webgl is not supported");
    }
    this.gl = gl;

    this.init();
  }
  protected init() {
    // init gl
    const createShader = (
      gl: WebGLRenderingContext,
      type: number,
      source: string
    ) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        return shader;
      }

      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    };

    const createProgram = (
      gl: WebGLRenderingContext,
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ) => {
      const program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      const success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (success) {
        return program;
      }

      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    };

    // Setup GLSL program
    const gl = this.gl;
    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSource
    )!;
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    )!;
    const program = createProgram(gl, vertexShader, fragmentShader)!;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);
  }

  drawRect(x: number, y: number, width: number, height: number) {
    const gl = this.gl;
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      x,
      y,
      x + width,
      y,
      x,
      y + height,
      x,
      y + height,
      x + width,
      y,
      x + width,
      y + height,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(
      gl.getParameter(gl.CURRENT_PROGRAM)!,
      "a_position"
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionUniformLocation = gl.getUniformLocation(
      gl.getParameter(gl.CURRENT_PROGRAM)!,
      "u_resolution"
    );
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    const colorUniformLocation = gl.getUniformLocation(
      gl.getParameter(gl.CURRENT_PROGRAM)!,
      "u_color"
    );
    const color = [1, 0, 0, 1];
    gl.uniform4f(colorUniformLocation, color[0], color[1], color[2], color[3]);

    debugger;
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

export const useTetris = ({
  start,
  controlInputs,
  renderMode,
}: useTetrisProps = {}): TetrisProps => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentMap = useRef([...DefaultMap]);
  const glRef = useRef<TheProgram | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!start) {
      return;
    }
    const theCanvas = canvasRef.current;
    if (!theCanvas) {
      return;
    }

    glRef.current = new TheProgram(theCanvas);
    glRef.current.drawRect(0, 0, 40, 40);
  });

  useEffect(() => {
    return;

    if (!start) {
      return;
    }
    const theCanvas = canvasRef.current;
    if (!theCanvas) {
      return;
    }

    glRef.current = new TheProgram(theCanvas);

    const mainloop = () => {
      frameRef.current = requestAnimationFrame(mainloop);
      const gl = glRef.current;
      if (!gl) {
        throw new Error("gl is not initialized");
      }

      // logic handling
      // 1. User position to map
      // 2. Check collision
      // 3. Map to gl coordinates
      // 4. Render

      // canvas = 400 * 800
      // map = 10 * 20
      // rect = 40 * 40
      const userPosition = { x: 5, y: 10 };
      const curBlock = Blocks[0];

      const mapCopied = currentMap.current.map((row) => [...row]);
      curBlock.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            const mapX = userPosition.x + x;
            const mapY = userPosition.y + y;
            if (mapY < 0) {
              return;
            }
            mapCopied[mapY][mapX] = 1;
          }
        });
      });

      // skip collision check
      // 3. Map to gl coordinates
      // draw map to triangles
      const draw = () => {
        mapCopied.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell === 1) {
              gl.drawRect(x * 40, y * 40, 40, 40);
            }
          });
        });
      };
      draw();
      console.log("drawing");
    };

    frameRef.current = requestAnimationFrame(mainloop);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
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
      <TheCanvas ref={canvasRef}></TheCanvas>
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

export default TheTetris;
