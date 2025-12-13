import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { PRESET_COLORS } from "./constants";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  // Sync customColor with value prop changes
  useEffect(() => {
    setCustomColor(value);
  }, [value]);

  return (
    <div className="">
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10 flex flex-row"
          >
            <div
              className="w-6 h-6 rounded border-2 border-border"
              style={{ backgroundColor: value }}
            />
            <span className="flex-1 text-left font-mono text-sm">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Preset Colors
              </Label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        value === color ? "hsl(var(--primary))" : "transparent",
                    }}
                    onClick={() => onChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label
                htmlFor="custom-color"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Custom Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id="custom-color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  onBlur={() => {
                    if (/^#[0-9A-F]{6}$/i.test(customColor)) {
                      onChange(customColor);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      /^#[0-9A-F]{6}$/i.test(customColor)
                    ) {
                      onChange(customColor);
                    }
                  }}
                  placeholder="#3b82f6"
                  className="flex-1 font-mono text-sm"
                />
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    onChange(e.target.value);
                  }}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
