import React from 'react';
import { UserAccount } from '../types/auth';
import { UserProfile } from '../types';
import { SubscriptionModal } from './SubscriptionModal';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  userProfile?: UserProfile;
  onExtendTrial: () => void;
  onUpgradePlan?: (newPlan: 'standard_lausanne' | 'pro_lausanne') => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onExtendTrial,
  onUpgradePlan
}) => {
  return (
    <SubscriptionModal
      isOpen={isOpen}
      onClose={onClose}
      currentUser={currentUser}
      userProfile={userProfile}
      onExtendTrial={onExtendTrial}
      onUpgradePlan={onUpgradePlan || (() => {})}
    />
  );
};
