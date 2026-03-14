import { Button } from "@/shared/ui";

interface SaveBuildButtonProps {
  disabled?: boolean;
}

export function SaveBuildButton({ disabled }: SaveBuildButtonProps) {
  return (
    <Button variant="outline" disabled={disabled}>
      Save build
    </Button>
  );
}

