import { Card } from "primereact/card";
import { getUserCurrencySymbol } from "../utils/currencyUtils";
import { formatMoney } from "../utils/moneyUtils";

function SummaryCards({
  bankBalance = 0,
  cashBalance = 0,
  investmentBalance = 0,
  totalSaving = 0,
}) {
  const symbol = getUserCurrencySymbol();

  const cards = [
    { title: "🏦 Bank Balance", value: bankBalance },
    { title: "💵 Cash Balance", value: cashBalance },
    { title: "📈 Investment Balance", value: investmentBalance },
    { title: "💰 Total Saving", value: totalSaving },
  ];

  return (
    <div className="grid mb-4 summary-responsive-grid">
      {cards.map((item, index) => (
        <div className="col-12 sm:col-6 xl:col-3" key={index}>
          <Card className="shadow-2 border-round-2xl summary-mobile-card">
            <div className="text-700 text-lg font-medium mb-2">{item.title}</div>
            <div className="text-900 text-3xl font-bold">
              {symbol} {formatMoney(item.value)}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;