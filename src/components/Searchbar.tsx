import { ThemeToggle } from "./ThemeToggle";
import UserAccountNav from "./UserAccountNav";

export default function Searchbar() {
  return <div className="bg-muted flex p-1 items-center justify-between rounded-lg">
      Search bar
      <div className="flex items-center gap-3 border-4">
         <ThemeToggle />
         <UserAccountNav />
      </div>
  </div>
}