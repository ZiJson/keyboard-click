import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { openSourceDir } from "@/lib/utils";
import { FolderUp } from "lucide-react";

interface Props {
  sources: string[];
  selectedSource: string;
  onValueChange: (value: string) => void;
}

const SourceSelect = ({ sources, onValueChange, selectedSource }: Props) => {
  if (sources.length === 0) return;
  return (
    <div className="flex items-center group gap-1.5">
      <Select onValueChange={onValueChange} value={selectedSource}>
        <SelectTrigger className="w-fit max-w-[150px] text-white/70 text-sm h-fit py-1 rounded-sm font-medium focus:outline-none border-none ">
          <SelectValue placeholder="Select a sound" />
        </SelectTrigger>
        <SelectContent className="opacity-80">
          {sources.map((source, index) => (
            <SelectItem
              value={source}
              key={index}
              className="font-[Compressa_VF] font-bold"
            >
              {source}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FolderUp
        className="h-4 w-4 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        onClick={openSourceDir}
      />
    </div>
  );
};

export default SourceSelect;
