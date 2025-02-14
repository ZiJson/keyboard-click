import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { appLocalDataDir, resolveResource } from "@tauri-apps/api/path";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const loadMp3Source = async () => {
  const entries = await fs.readDir("sound-resources", {
    baseDir: fs.BaseDirectory.AppLocalData,
  });
  const sources = entries
    .filter((entry) => entry.name.endsWith(".mp3") && entry.isFile)
    .map((entry) => entry.name);

  return sources;
};

export async function loadMp3ByName(fileName: string) {
  try {
    const mp3Path = await path.join("sound-resources", fileName);
    // 读取二进制 MP3 文件
    const binaryData = await fs.readFile(mp3Path, {
      baseDir: fs.BaseDirectory.AppLocalData,
    });
    // 将 ArrayBuffer 转换为 Base64
    const uint8Array = new Uint8Array(binaryData);
    const numbers = Array.from(uint8Array);
    const base64String = btoa(String.fromCharCode.apply(null, numbers));

    // 创建 Base64 数据 URL
    const audioUrl = `data:audio/mp3;base64,${base64String}`;

    return audioUrl;
  } catch (error) {
    console.error("Failed to load sound:", error);
  }
}

export const initResource = async () => {
  const sourceDir = await resolveResource(
    await path.join("resources", "sound-resources")
  );
  const sources = await fs.readDir(sourceDir);

  const targetDir = await appLocalDataDir().then((dir) =>
    path.join(dir, "sound-resources")
  );
  if (!(await fs.exists(targetDir))) {
    await fs.mkdir(targetDir, {
      recursive: true,
    });
  }
  sources.forEach(async (source) => {
    const sourcePath = await path.join(sourceDir, source.name);
    const targetPath = await path.join(targetDir, source.name);
    if (!(await fs.exists(targetPath))) {
      await fs.copyFile(sourcePath, targetPath);
      console.log(`Copied ${source.name} to ${targetPath}`);
    }
  });

  console.log(targetDir);
};

export const watchResource = async (cb: () => void) => {
  try {
    if (
      !(await fs.exists("sound-resources", {
        baseDir: fs.BaseDirectory.AppLocalData,
      }))
    ) {
      await fs.mkdir("sound-resources", {
        recursive: true,
        baseDir: fs.BaseDirectory.AppLocalData,
      });
    }
    const unWatch = await fs.watch("sound-resources", cb, {
      baseDir: fs.BaseDirectory.AppLocalData,
      recursive: true,
      delayMs: 1000,
    });
    return unWatch;
  } catch (error) {
    console.error("Failed to watch resources:", error);
    throw error;
  }
};

export const openSourceDir = async () => {
  const sourceDir = await appLocalDataDir().then((dir) =>
    path.join(dir, "sound-resources")
  );
  const entries = await fs.readDir(sourceDir);
  await revealItemInDir(await path.join(sourceDir, entries[0].name));
};

export const getCachedSound = () => {
  return window.localStorage.getItem("cachedSound");
};

export const setCachedSound = (sound: string) => {
  window.localStorage.setItem("cachedSound", sound);
};
