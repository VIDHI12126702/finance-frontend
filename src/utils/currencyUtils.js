export function getUserCurrencyCode() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  return user?.currency || "INR";
}

export function getUserCurrencySymbol() {
  const currency = getUserCurrencyCode();

  const symbolMap = {
    INR: "₹",
    USD: "$",
    CAD: "C$",
    AED: "د.إ ",
    EUR: "€",
    GBP: "£",
    AUD: "A$",
    NZD: "NZ$",
    SGD: "S$",
    JPY: "¥",
  };

  return symbolMap[currency] || currency + " ";
}