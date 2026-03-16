import { Button } from "@/shared/ui";

interface GenerateBuildButtonProps {
  disabled?: boolean;
}

export function GenerateBuildButton({ disabled }: GenerateBuildButtonProps) {
  return (
    <Button disabled={disabled}>
      Generate build
    </Button>
  );
}

