type ReportSummaryCardsProps = {
  cards: {
    title: string;
    value: string | number;
  }[];
};

export function ReportSummaryCards({ cards }: ReportSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="rounded-xl border bg-white p-5">
          <p className="text-sm text-zinc-500">{card.title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
