import ActionRow from '../components/ActionRow';

export const paymentColumns: any[] = [
  {
    name: 'Invoice ID',
    selector: (row: { id: any }) => row?.id,
  },
  {
    name: 'Amount',
    selector: (row: { amount: any }) => row?.amount,
  },
  {
    name: 'Issued to',
    selector: (row: { issuedTo: any }) =>
      `${row?.issuedTo?.firstName} ${row?.issuedTo?.lastName}`,
  },
  {
    name: 'Status',
    selector: (row: { status: any }) => row?.status ?? 'Processing',
  },
  {
    name: 'Actions',
    cell: (row: { id: any; key: string }) => <ActionRow row={row} />,
  },
];

export const auditTrailColumns: any[] = [
  {
    name: 'ID',
    selector: (row: { id: any }) => row?.id,
  },
  {
    name: 'Type',
    selector: (row: { type: any }) => row?.type.toUpperCase(),
  },
  {
    name: 'Issued to',
    selector: (row: { user: any }) =>
      `${row?.user?.firstName} ${row?.user?.lastName}`,
  },
  {
    name: 'Date Created',
    selector: (row: { date: any }) => row?.date,
  }
];