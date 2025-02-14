import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { Howl } from "howler";
import "./App.css";
import TextPressure from "./components/ui/TextPressure";
import { Volume1, Volume2 } from "lucide-react";
import ElasticSlider from "./components/ui/ElasticSlider";
import { RippleButton } from "./components/magicui/ripple-button";
import ShinyText from "./components/ui/ShinyText";
import { Ripple } from "./components/magicui/ripple";
import { invoke } from "@tauri-apps/api/core";
import {
  getCachedSound,
  initResource,
  loadMp3ByName,
  loadMp3Source,
  setCachedSound,
  watchResource,
} from "./lib/utils";
import SourceSelect from "./components/SourceSelect";

function App() {
  const [listening, setListening] = useState(false);
  const [key, setKey] = useState<string>("");
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const soundRef = useRef<Howl | null>(null); // 🔹 用 useRef 存储 sound 实例

  useEffect(() => {
    const init = async () => {
      await initResource();
      await loadMp3Source().then((entries) => {
        console.log(entries);
        setSources(entries);
      });
    };
    init();
    const unWatch = watchResource(() => {
      loadMp3Source().then((entries) => {
        setSources(entries);
      });
    });

    return () => {
      unWatch.then((unWatch) => unWatch());
    };
  }, []);

  const onSelectValueChange = (value: string) => {
    setSelectedSource(value);
  };

  useEffect(() => {
    const cachedSound = getCachedSound();
    if (sources.length === 0 || cachedSound === selectedSource) return;
    if (selectedSource === "" || !sources.includes(selectedSource)) {
      setCachedSound("");
      return setSelectedSource(
        cachedSound && sources.includes(cachedSound) ? cachedSound : sources[0]
      );
    }
    loadMp3ByName(selectedSource).then((audioUrl) => {
      if (!audioUrl) return;
      soundRef.current = new Howl({
        src: [audioUrl],
        volume: 0.5,
        format: ["mp3"],
        onload: () => {
          console.log("🔊 Sound loaded successfully!");
          setCachedSound(selectedSource);
        },
        onloaderror: (_id, error) => {
          console.error("❌ Sound load failed:", error);
        },
      });
    });

    return () => {
      soundRef.current?.unload();
    };
  }, [selectedSource, sources]);

  const toggleListening = async () => {
    if (listening) {
      await invoke("stop_listening");
    } else {
      await invoke("start_listening");
    }
    setListening((prev) => !prev);
  };

  const onVolumeChange = (value: number) => {
    if (soundRef.current) {
      soundRef.current.volume(value / 100);
      console.log(`New volume: ${soundRef.current.volume()}`);
    }
  };

  useEffect(() => {
    if (!listening || !soundRef.current) return;

    const unlistenPromise = listen("play_key_sound", (event) => {
      if (soundRef.current) {
        soundRef.current.play();
      }
      setKey(event.payload as string);
      if (event.payload === "F5") toggleListening();
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [listening]);

  return (
    <div className="w-screen h-screen relative overflow-hidden dark bg-background flex flex-col items-center justify-start font-[Compressa_VF] p-5">
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
      <div className="flex flex-col grow items-center justify-end gap-4 z-10">
        <RippleButton
          onClick={toggleListening}
          className={`font-bold rounded-full border-2 focus:outline-none ${
            listening ? "border-[#753333]" : "border-[#353535]"
          }`}
        >
          <ShinyText
            text={listening ? "stop listening" : "start listening"}
            className={`${listening ? " text-[#753333]" : ""}`}
            speed={3}
          />
        </RippleButton>
        <div className="fixed bottom-6 left-4">
          <SourceSelect
            sources={sources}
            onValueChange={onSelectValueChange}
            selectedSource={selectedSource}
          />
        </div>
        <ElasticSlider
          leftIcon={<Volume1 color="#ffffff" />}
          rightIcon={<Volume2 color="#ffffff" />}
          startingValue={0}
          defaultValue={50}
          maxValue={100}
          className="w-[200px]"
          isStepped
          stepSize={5}
          onChange={onVolumeChange}
        />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center text-6xl font-bold tracking-tighter text-white/50">
          {key}
        </p>
        <Ripple key={key} mainCircleSize={150} />
      </div>
    </div>
  );
}

export default App;
