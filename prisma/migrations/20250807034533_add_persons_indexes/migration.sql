-- CreateIndex
CREATE INDEX "idx_persons_leader_name" ON "persons"("leader_name");

-- CreateIndex
CREATE INDEX "idx_persons_phone" ON "persons"("phone");

-- CreateIndex
CREATE INDEX "idx_persons_station_number" ON "persons"("station_number");

-- CreateIndex
CREATE INDEX "idx_persons_created_at" ON "persons"("created_at");

-- CreateIndex
CREATE INDEX "idx_persons_leader_name_id" ON "persons"("leader_name", "id");
