import { TableSkeleton } from "./table-skeleton";

export function PaymentTableSkeleton() {
  return (
    <TableSkeleton 
      columns={6}
      rows={5}
      headerLabels={["Transaction", "Amount", "Method", "Status", "Date", "Actions"]}
    />
  );
}

