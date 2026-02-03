import Timer from "@/components/Timer";

export default function Home() {
  return (
    <div className="w-screen h-full overflow-hidden relative">
      <img
        src={`spiderverse.webp`}
        alt="Background"
        className="absolute w-full h-full bottom-0 object-cover xl:object-fill opacity-75 z-0"
      />
      <main className="h-full flex flex-col gap-8 items-center justify-center relative z-10">
        <Timer />
      </main>
    </div>
  );
}
