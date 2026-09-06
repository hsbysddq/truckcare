import Navbar from "@/components/Navbar";

export default function PlaceholderPage({ title, message }) {
  return (
    <>
      <Navbar forceSolid />
      <main className="flex min-h-screen items-center justify-center bg-white px-6 pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-500">
            {message}
          </p>
        </div>
      </main>
    </>
  );
}
