import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/components/temple/auth-gate";
import { TempleShell } from "@/components/temple/shell";
import { getUserMap } from "@/lib/temple/map";

export const Route = createFileRoute("/map")({
  component: () => (
    <AuthGate>
      <MapPage />
    </AuthGate>
  ),
});

function MapPage() {
  const map = useQuery({ queryKey: ["netmap"], queryFn: () => getUserMap() });
  const data = map.data;
  return (
    <TempleShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <p className="font-sans text-[11px] tracking-[0.2em] text-cyan uppercase">From saved findings</p>
        <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight">Network map</h1>
        <p className="mt-2 text-[13px] text-muted">
          {data
            ? `${data.attackSurface.exposedServices} hosts · ${data.attackSurface.vulnerableHosts} high risk`
            : "Loading the map…"}
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {(data?.nodes ?? []).map((node) => (
            <li key={node.id} className="rounded-sm border border-border bg-surface px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] text-fg">{node.label}</span>
                <span className="font-sans text-[10px] tracking-[0.12em] text-muted uppercase">{node.risk}</span>
              </div>
              <p className="mt-1 text-[12px] text-faint">
                {node.type} · {node.findings.length} findings
              </p>
            </li>
          ))}
          {data && data.nodes.length === 0 ? (
            <li className="text-[13px] text-muted">No findings yet. Run a task, then come back.</li>
          ) : null}
        </ul>
        {(data?.attackSurface.recommendedHardening ?? []).length > 0 ? (
          <ul className="mt-4 list-disc pl-5 text-[13px] text-muted">
            {data?.attackSurface.recommendedHardening.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </TempleShell>
  );
}
