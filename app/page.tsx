import Link from "next/link";
import Button from "./components/UI/button";

export default function Home() {
  return (
    <main>
      <Button>
        <Link href="/login">Login</Link>
      </Button>
    </main>
  );
}
