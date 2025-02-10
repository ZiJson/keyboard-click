import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Howl } from "howler";
import "./App.css";
import TextPressure from "./components/ui/TextPressure";
import { Volume1, Volume2 } from "lucide-react";
import ElasticSlider from "./components/ui/ElasticSlider";
import { RippleButton } from "./components/magicui/ripple-button";

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
      html5: false, // 确保使用 Web Audio API
      volume: 1,
    }).load();

    // 監聽來自後端的 play_key_sound 事件
    const unlistenPromise = listen("play_key_sound", () => {
      sound.play();
      console.log("play_key_sound");
    });

    // 清理監聽器
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [listening]);

  return (
    <div
      id="app"
      className="w-screen h-screen overflow-hidden dark bg-background flex flex-col items-center justify-start font-[Compressa_VF]"
    >
      <div className="w-full h-1/2">
        <TextPressure
          text="click!"
          flex={false}
          alpha={false}
          stroke={false}
          width={true}
          weight={true}
          italic={true}
          textColor="#ffffff"
          strokeColor="#ff0000"
        />
      </div>
      <div>
        <RippleButton onClick={toggleListening} className="font-bold">
          {listening ? "Stop listening" : "Start listening"}
        </RippleButton>
        <ElasticSlider
          leftIcon={<Volume1 color="#ffffff" />}
          rightIcon={<Volume2 color="#ffffff" />}
          startingValue={0}
          defaultValue={50}
          maxValue={100}
          className="w-[300px]"
          isStepped
          stepSize={5}
        />
      </div>
    </div>
  );
}

export default App;
