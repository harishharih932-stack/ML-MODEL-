import { Waves } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";

interface Props {
  apiKey: string;
  setApiKey: (v: string) => void;
  aiEnabled: boolean;
  setAiEnabled: (v: boolean) => void;
}

export function Header({ apiKey, setApiKey, aiEnabled, setAiEnabled }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600 text-white">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-900">AuraPhC</div>
            <div className="text-[11px] text-slate-500">
              Formula-Calibrated Inverse Mapping · Photonic Crystal Pressure Sensor
            </div>
          </div>
        </div>
        <SettingsPanel
          apiKey={apiKey}
          setApiKey={setApiKey}
          enabled={aiEnabled}
          setEnabled={setAiEnabled}
        />
      </div>
    </header>
  );
}
