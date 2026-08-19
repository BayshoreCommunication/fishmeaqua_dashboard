import { UserFull } from "@/app/actions/user";

export type StageKey =
  | "signed_up"
  | "verified"
  | "trial_not_setup"
  | "trial_active"
  | "trial_expired"
  | "paying";

export interface Stage {
  key: StageKey;
  label: string;
  badgeClass: string;
}

// Classifies a user into a single lifecycle stage so it's obvious at a
// glance where each sign-up dropped off: never started a trial, started
// one but never finished setting up the widget, actively testing, trial
// ran out, or converted to paid.
export function getUserStage(user: UserFull): Stage {
  const hasWidget = Boolean(user.vector_store_id);
  const isTrained = Boolean(user.train_data?.is_trained);
  const trialEnded =
    !user.is_subscribed && Boolean(user.subscription_end_date);

  if (user.has_paid_subscription) {
    return { key: "paying", label: "Paying Customer", badgeClass: "bg-purple-50 text-purple-700" };
  }
  if (user.is_subscribed && (!hasWidget || !isTrained)) {
    return { key: "trial_not_setup", label: "Trial – Widget Not Set Up", badgeClass: "bg-amber-50 text-amber-700" };
  }
  if (user.is_subscribed) {
    return { key: "trial_active", label: "Trial – Active & Testing", badgeClass: "bg-green-50 text-green-700" };
  }
  if (trialEnded) {
    return { key: "trial_expired", label: "Trial Expired", badgeClass: "bg-red-50 text-red-700" };
  }
  if (user.is_verified) {
    return { key: "verified", label: "Signed Up – No Trial Started", badgeClass: "bg-blue-50 text-blue-700" };
  }
  return { key: "signed_up", label: "Signed Up – Unverified", badgeClass: "bg-gray-100 text-gray-600" };
}
