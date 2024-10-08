import ObjectViewer from "@/components/ObjectViewer";
import ENV_SERVER from "@/scripts/ENV_SERVER";
import { useSocket } from "@/scripts/providers/SocketProvider";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function Home() {
  const { connect, connected } = useSocket();
  const router = useRouter();
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    if (connected) {
      router.push("/tetris");
    }
  }, [connected]);

  useEffect(() => {
    fetch("/api/user/count")
      .then((res) => res.json())
      .then((res) => {
        setUserCount(res?.count ?? null);
      });
  }, []);

  return (
    <div style={{ position: "relative" }}>
      Home
      <div>
        <button
          onClick={() => {
            connect();
          }}
        >
          connect
        </button>
      </div>
      <div>Current Users : {userCount === null ? "loading..." : userCount}</div>
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
