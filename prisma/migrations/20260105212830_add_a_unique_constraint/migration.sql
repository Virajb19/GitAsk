/*
  Warnings:

  - A unique constraint covering the columns `[OauthProvider,OauthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_OauthProvider_OauthId_key" ON "User"("OauthProvider", "OauthId");
