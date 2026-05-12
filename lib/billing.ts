const DASHBOARD_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function hasDashboardAccess(
  subscriptionStatus: string | null | undefined,
  stripeSubscriptionId: string | null | undefined
) {
  return Boolean(
    stripeSubscriptionId &&
      subscriptionStatus &&
      DASHBOARD_SUBSCRIPTION_STATUSES.has(subscriptionStatus)
  );
}
