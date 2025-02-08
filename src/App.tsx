import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Howl } from "howler";

function App() {
  const [listening, setListening] = useState(false);

  const startListening = async () => {
    await invoke("start_listening");
    setListening(true);
  };

  useEffect(() => {
    // 音效的設定
    const sound = new Howl({
      src: ["/sounds/click.mp3"],
    });
    sound.volume(0.2);

    // 監聽來自後端的 play_key_sound 事件
    const unlistenPromise = listen("play_key_sound", () => {
      console.log("鍵盤按鍵觸發，播放音效");
      sound.play();
    });

    // 清理監聽器
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return (
    <div className="app">
      <h1>機械鍵盤模擬器</h1>
      <button onClick={startListening} disabled={listening}>
        {listening ? "正在監聽..." : "開始監聽"}
      </button>
    </div>
  );
}

export default App;
