
-- trustpay:constraints (appended to the init migration by scripts/append-constraints.mjs)
-- At most one successful payment per milestone (cannot double-fund)
CREATE UNIQUE INDEX "one_success_payment_per_milestone" ON "Payment"("milestoneId") WHERE "status" = 'SUCCESS';
-- At most one live payout per milestone (cannot double-pay); a FAILED attempt frees the slot for a retry
CREATE UNIQUE INDEX "one_live_payout_per_milestone" ON "Payout"("milestoneId") WHERE "status" IN ('PENDING', 'PROCESSING', 'SUCCESS');
-- One open dispute per milestone
CREATE UNIQUE INDEX "one_open_dispute_per_milestone" ON "Dispute"("milestoneId") WHERE "status" IN ('OPEN', 'UNDER_REVIEW');
-- Sanity checks
ALTER TABLE "Project"   ADD CONSTRAINT "client_ne_freelancer" CHECK ("clientId" <> "freelancerId");
ALTER TABLE "Milestone" ADD CONSTRAINT "milestone_amount_pos" CHECK ("amount" > 0);
ALTER TABLE "Payment"   ADD CONSTRAINT "payment_amount_pos"   CHECK ("amount" > 0);
ALTER TABLE "Payout"    ADD CONSTRAINT "payout_amount_pos"    CHECK ("amount" > 0 AND "platformFee" >= 0);
