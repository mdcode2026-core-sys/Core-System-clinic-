export const kpiFormatter = {
  async integer(value: number): Promise<string> {
    return Math.round(value).toLocaleString("en-US");
  },

  async currency(value: number): Promise<string> {
    return (value / 1000).toLocaleString("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  },

  async percentage(value: number): Promise<string> {
    return `${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
  },

  async minutes(value: number): Promise<string> {
    return `${Math.round(value)} دقيقة`;
  },
};
