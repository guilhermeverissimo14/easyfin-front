'use client';

import PayrollCreate from '../../create/page';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function PayrollEdit() {
    const {id} = useParams();

  return <PayrollCreate payrollCloneId={id as string} />;
}