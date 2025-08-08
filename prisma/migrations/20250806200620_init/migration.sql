-- CreateTable
CREATE TABLE "leaders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT NOT NULL,
    "residence" TEXT,
    "phone" TEXT,
    "workplace" TEXT,
    "center_info" TEXT,
    "station_number" TEXT,
    "votes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "persons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leader_name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "residence" TEXT,
    "phone" TEXT,
    "workplace" TEXT,
    "center_info" TEXT,
    "station_number" TEXT,
    "votes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
