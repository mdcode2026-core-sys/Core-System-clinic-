/**
 * Shared KPI value formatting.
 * Business/domain formatters must not embed a UI language. Labels and units
 * are localized by the presentation layer.
 */
export const kpiFormatter = {
  async integer(value: number): Promise<string> {
    return Math.round(value).toLocaleString("en-US", { numberingSystem: "latn" });
  },

  async currency(value: number): Promise<string> {
    return (value / 1000).toLocaleString("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
      numberingSystem: "latn",
    });
  },

  async percentage(value: number): Promise<string> {
    return `${value.toLocaleString("en-US", { maximumFractionDigits: 1, numberingSystem: "latn" })}%`;
  },

  async minutes(value: number): Promise<string> {
    return Math.round(value).toLocaleString("en-US", { numberingSystem: "latn" });
  },
};
