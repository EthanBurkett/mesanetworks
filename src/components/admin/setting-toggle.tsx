import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingToggle({
  id,
  label,
  description,
  defaultChecked,
  checked,
  onCheckedChange,
  disabled,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
