import Link from "next/link";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";
import { CarSvg } from "@/components/car/CarSvg";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main id="main" className="flex min-h-screen flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        <p className="eyebrow mb-6">404</p>
        <h1 className="t-headline">
          This one isn&rsquo;t
          <br />
          on the lot.
        </h1>
        <p className="t-lede mt-6 max-w-md">
          The page you&rsquo;re looking for was moved, sold, or never existed.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/inventory">Explore Inventory</Button>
          <Button href="/" variant="ghost">
            Back to start
          </Button>
        </div>
        <div className="mt-16 w-full max-w-xl opacity-40" aria-hidden="true">
          <CarSvg idPrefix="nf" shadow={false} />
        </div>
        <p className="sr-only">
          <Link href="/">Return to the Farnsworth Motors homepage</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
