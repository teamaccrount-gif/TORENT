-- DropForeignKey
ALTER TABLE "user_access" DROP CONSTRAINT "user_access_user_id_fkey";

-- AddForeignKey
ALTER TABLE "user_access" ADD CONSTRAINT "user_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
