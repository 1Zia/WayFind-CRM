import { ReportSummaryCards } from "@/components/reports/report-summary-cards";

type LeadReportProps = {
  report: {
    totalLeads: number;
    leadsByStatus: Record<string, number>;
    convertedLeads: number;
    lostLeads: number;
    upcomingFollowUps: {
      id: string;
      leadName: string;
      company: string | null;
      followUpDate: string | null;
    }[];
  } | null;
};

export function LeadReport({ report }: LeadReportProps) {
  if (!report) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Leads</h2>
      <ReportSummaryCards
        cards={[
          { title: "Total Leads", value: report.totalLeads },
          { title: "Converted Leads", value: report.convertedLeads },
          { title: "Lost Leads", value: report.lostLeads },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownTable title="Leads by Status" rows={report.leadsByStatus} />
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b px-4 py-3 font-medium">
            Upcoming Follow-ups
          </div>
          <table className="w-full text-sm">
            <tbody>
              {report.upcomingFollowUps.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.leadName}</div>
                    <div className="text-xs text-zinc-500">
                      {lead.company ?? "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {lead.followUpDate ?? "-"}
                  </td>
                </tr>
              ))}
              {report.upcomingFollowUps.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-zinc-500"
                    colSpan={2}
                  >
                    No upcoming follow-ups.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function BreakdownTable({
  title,
  rows,
}: {
  title: string;
  rows: Record<string, number>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-4 py-3 font-medium">{title}</div>
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(rows).map(([label, value]) => (
            <tr key={label} className="border-b last:border-0">
              <td className="px-4 py-3 capitalize">{label.replace("_", " ")}</td>
              <td className="px-4 py-3 text-right">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
