import Hero from "../components/Hero";
import GlassCard from "../components/GlassCard";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="grid">
        <GlassCard title="Register Profile" link="/register" />
        <GlassCard title="Animal Patient" link="/patient" image />
        <GlassCard title="Medical Notes" link="/medical" />
        <GlassCard title="Medications" link="/medical" />
        <GlassCard title="Treatment Receipt" link="/medical" />
      </div>
    </>
  );
}
