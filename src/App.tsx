import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Howl } from "howler";
import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  const [listening, setListening] = useState(false);

  const toggleListening = async () => {
    if (listening) {
      await invoke("stop_listening");
    } else {
      await invoke("start_listening");
    }
    setListening((pre) => !pre);
  };

  useEffect(() => {
    if (!listening) {
      return;
    }
    // 音效的設定
    const sound = new Howl({
      src: ["/sounds/click.mp3"],
    });
    sound.volume(0.2);

    // 監聽來自後端的 play_key_sound 事件
    const unlistenPromise = listen("play_key_sound", () => {
      sound.play();
    });

    // 清理監聽器
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [listening]);

  return (
    <div>
      <h1 className="">機械鍵盤模擬器</h1>
      <Button onClick={toggleListening}>
        {listening ? "停止監聽" : "開始監聽"}
      </Button>
    </div>
  );
}

export default App;
