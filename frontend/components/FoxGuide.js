export default function FoxGuide({ mood = "curious", message }) {
  return (
    <div className="mb-5 flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
      <img
        src="/mascot/fox-curious.png"
        alt="Fox guide"
        className="h-16 w-16 select-none"
      />
      <div>
        <p className="text-sm font-medium text-emerald-800">
          {message}
        </p>
        <p className="text-[11px] text-emerald-600 mt-0.5">
          — SkillSwap guide
        </p>
      </div>
    </div>
  );
}
