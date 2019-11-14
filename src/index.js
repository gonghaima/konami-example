import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import useHotKey from "./useHotKey";

const AppWrapper = styled.div`
  padding: 2rem;
  font-family: sans-serif;
  text-align: center;
`;

const BigButton = styled.button`
  padding: 1rem;
  color: white;
  background: dodgerblue;
  border: 1px solid navy;
  border-radius: 0.5rem;
`;

const sequence = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
  "Enter"
];

const Konami = () => {
  const [keysPressed, setKeysPress] = React.useState(false);
  useHotKey(sequence, () => setKeysPress(true));

  return (
    keysPressed && (
      <div>
        <h1>You hit the Konami Code</h1>
        <BigButton onClick={() => setKeysPress(false)}>Reset Code</BigButton>
      </div>
    )
  );
};

function App() {
  const [showKonami, setShow] = React.useState(false);
  const BtnRef = React.useRef(null);
  return (
    <AppWrapper>
      <div>
        <BigButton
          ref={BtnRef}
          onClick={() => {
            setShow(!showKonami);
            BtnRef.current.blur();
          }}
        >
          Turn {showKonami ? "off" : "on"} Konami
        </BigButton>
      </div>
      {showKonami && <Konami />}
    </AppWrapper>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
