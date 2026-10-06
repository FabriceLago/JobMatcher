export interface InvoiceReceipt {
  id: string;
  invoiceNumber: string;
  date: string;
  planName: string;
  amountChf: number;
  vatChf: number;
  paymentMethod: 'stripe_card' | 'qr_bill_swiss';
  status: 'paid' | 'pending';
  receiptRef: string;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  trialStartedAt: string;
  trialExpiresAt: string;
  subscriptionPlan: 'free_trial' | 'standard_lausanne' | 'pro_lausanne' | 'expired';
  invoices?: InvoiceReceipt[];
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
}

export function calculateTrialDaysRemaining(expiresAt: string): {
  days: number;
  hours: number;
  isExpired: boolean;
  formattedText: string;
} {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diffMs = expiry - now;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      isExpired: true,
      formattedText: 'Essai expiré'
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let formattedText = '';
  if (days > 0) {
    formattedText = `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
  } else {
    formattedText = `${hours} heure${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
  }

  return {
    days,
    hours,
    isExpired: false,
    formattedText
  };
}
