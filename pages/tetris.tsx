import TheTetris, { useTetris } from "@/components/TheTetris";
import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";

function Tetris() {
  const [start, setStart] = useState(false);

  const tetrisProps = useTetris({ start });

  return (
    <Container>
      <Controller>
        <button
          style={{ width: "100%" }}
          onClick={() => {
            setStart(true);
          }}
        >
          Start
        </button>
        <button
          style={{ width: "100%" }}
          onClick={() => {
            setStart(false);
          }}
        >
          Stop
        </button>
      </Controller>
      <GameWrapper>
        <TheTetris {...tetrisProps}></TheTetris>
      </GameWrapper>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #dfdfdf;
`;

const Controller = styled.div`
  position: fixed;
  left: 10px;
  top: 10px;
  border: 1px solid black;
  background-color: white;
  padding: 10px;
  width: 200px;
  border-radius: 10px;
`;

const GameWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Tetris;
