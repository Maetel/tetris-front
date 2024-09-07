import ObjectViewer from "@/components/ObjectViewer";
import ENV_SERVER from "@/scripts/ENV_SERVER";
import { useSocket } from "@/scripts/providers/SocketProvider";
import React from "react";

function Home() {
  const { connect, disconnect, notification, users } = useSocket();
  return (
    <div style={{ position: "relative" }}>
      Home
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          border: "1px solid black",
        }}
      >
        Users
        <ObjectViewer object={users}></ObjectViewer>
      </div>
      <div>
        <button
          onClick={() => {
            connect();
          }}
        >
          connect
        </button>
        <button
          onClick={() => {
            disconnect();
          }}
        >
          disconnect
        </button>
        <button onClick={() => {}}>get user list</button>
      </div>
      <div>
        <ObjectViewer object={notification} />
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  const serverUrl = ENV_SERVER.SERVER_URL;

  const onError = {
    redirect: {
      destination: "/error",
      permanent: false,
    },
  };

  try {
    const pong = await fetch(serverUrl + "/api/ping").then((res) => res.text());
    if (pong !== "pong") {
      throw new Error("Invalid response from server");
    }
  } catch (e) {
    return onError;
  }

  // console.log({ serverUrl });
  return { props: {} };
};

export default Home;
