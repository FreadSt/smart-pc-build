import { Card, Button } from "@/shared/ui";

export function BudgetForm() {
  return (
    <Card>
      <h2 className="mb-2 text-sm font-semibold">Budget settings</h2>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        Budget controls UI will be here.
      </p>
      <Button variant="primary">Apply budget</Button>
    </Card>
  );
}

