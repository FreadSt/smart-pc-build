import { Modal } from "@/shared/ui";

interface ChangeComponentModalProps {
  open?: boolean;
}

export function ChangeComponentModal({ open }: ChangeComponentModalProps) {
  return (
    <Modal open={open}>
      <h2 className="mb-2 text-base font-semibold">Change component</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        Component selection UI will be here.
      </p>
    </Modal>
  );
}

