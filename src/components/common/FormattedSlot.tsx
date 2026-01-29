import React from 'react';
import { formatSlot } from '@/utils/formatters';

interface FormattedSlotProps {
  slot: string | undefined;
  className?: string;
}

const FormattedSlot: React.FC<FormattedSlotProps> = ({ slot, className }) => {
  return (
    <span className={className}>
      {formatSlot(slot)}
    </span>
  );
};

export default FormattedSlot;
