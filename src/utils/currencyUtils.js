export const getUserCurrency = () => {
  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) return "INR";

    if (user.currency) {
      return user.currency.toUpperCase();
    }

    if (user.country) {
      const country = user.country.toLowerCase();

      if (country === "canada") return "CAD";
      if (country === "india") return "INR";
      if (country === "usa" || country === "united states") return "USD";
      if (country === "uk" || country === "united kingdom") return "GBP";
      if (country === "australia") return "AUD";
    }

    return "INR";
  } catch (error) {
    return "INR";
  }
};

export const getUserCurrencySymbol = () => {
  const currency = getUserCurrency();

  switch (currency) {
    case "CAD":
      return "C$";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "AUD":
      return "A$";
    case "INR":
    default:
      return "₹";
  }
};