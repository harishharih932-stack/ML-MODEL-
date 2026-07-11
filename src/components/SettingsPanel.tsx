import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

interface Props {
  apiKey: string;
  setApiKey: (v: string) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

export function SettingsPanel({ apiKey, setApiKey, enabled, setEnabled }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-white">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Optional AI commentary layer.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6 px-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="groq-key" className="text-sm font-medium">
              Groq API Key (optional)
            </Label>
            <Input
              id="groq-key"
              type="password"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              Enables AI-generated plain-English insights about each reading. The pressure number
              itself is always calculated by the formula engine — the API is only used for
              explanatory commentary, never for the prediction itself. The key is stored in your
              browser only.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <div className="text-sm font-medium">Enable AI Insights</div>
              <div className="text-xs text-slate-500">Show a Groq-generated safety note.</div>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
