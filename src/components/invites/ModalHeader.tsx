interface ModalHeaderProps {
  title: string;
  subtitle?: string;
}

export function ModalHeader({ title, subtitle }: ModalHeaderProps) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">{title}</h2>
      {subtitle && <p className="text-neutral-500 dark:text-neutral-400 mt-2">{subtitle}</p>}
    </div>
  );
}