import { useGetPaymentsByDoctorIdQuery } from '@/store/paymentApi';
import { useAuth } from '@/contexts/AuthContext';

export const useDoctorPayments = () => {
  const { user } = useAuth();
  const doctorId = user && typeof user === 'object' && 'uid' in user ? user.uid : null;

  const {
    data: paymentsData,
    isLoading,
    error,
    refetch
  } = useGetPaymentsByDoctorIdQuery(
    { doctorId: doctorId! },
    { skip: !doctorId }
  );

  return {
    payments: paymentsData || [],
    isLoading,
    error,
    refetch,
    doctorId
  };
};
