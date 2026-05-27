-- CreateIndex
CREATE INDEX "applications_jobId_idx" ON "applications"("jobId");

-- CreateIndex
CREATE INDEX "applications_candidateId_idx" ON "applications"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_profiles_notificationsEnabled_telegramChatId_idx" ON "candidate_profiles"("notificationsEnabled", "telegramChatId");

-- CreateIndex
CREATE INDEX "contracts_companyId_idx" ON "contracts"("companyId");

-- CreateIndex
CREATE INDEX "contracts_candidateId_idx" ON "contracts"("candidateId");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "jobs_companyId_idx" ON "jobs"("companyId");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "otp_codes_userId_used_expiresAt_idx" ON "otp_codes"("userId", "used", "expiresAt");

-- CreateIndex
CREATE INDEX "profile_scores_totalScore_idx" ON "profile_scores"("totalScore");
