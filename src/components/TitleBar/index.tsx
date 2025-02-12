import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import KSvg from "../../assets/K.svg";
import { openUrl } from "@tauri-apps/plugin-opener";

const appWindow = getCurrentWindow();

const TitleBar = () => {
  return (
    <div
      data-tauri-drag-region
      className="font-mono bg-background/10 fixed top-0 inset-x-0 z-20  overflow-hidden flex items-center justify-between opacity-0 transition-opacity duration-200 ease-in-out hover:opacity-100"
    >
      <div
        onClick={() => openUrl("https://github.com/ZiJson/KeyPong")}
        className="flex cursor-pointer items-center text-primary-foreground/70 text-[0.8rem]"
      >
        <img src={KSvg} alt="logo" className="w-7 h-7 p-2" />
        KeyPong
      </div>
      <div className="flex ">
        <TitleBarButton onClick={() => appWindow.minimize()}>
          <Minus className="w-4 text-primary-foreground" />
        </TitleBarButton>
        <TitleBarButton onClick={() => appWindow.close()}>
          <X className="w-4 text-primary-foreground" />
        </TitleBarButton>
      </div>
      <div className="fixed bottom-1 right-2 text-primary-foreground/70 text-[0.8rem]">
        © {new Date().getFullYear()} ZiJson
      </div>
    </div>
  );
};

export default TitleBar;

const TitleBarButton = ({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="w-7 h-7 flex items-center justify-center hover:bg-background/30 "
      {...props}
    >
      {children}
    </div>
  );
};
