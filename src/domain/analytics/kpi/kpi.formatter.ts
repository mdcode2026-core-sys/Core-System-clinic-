export const kpiFormatter = {
  async integer(value: number): Promise<string> {
    return Math.round(value).toLocaleString("ar-SA");
  },

  async currency(value: number): Promise<string> {
    return (value / 1000).toLocaleString("ar-SA", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  },

  async percentage(value: number): Promise<string> {
    return `${value.toLocaleString("ar-SA", { maximumFractionDigits: 1 })}%`;
  },

  async minutes(value: number): Promise<string> {
    return `${Math.round(value)} دقيقة`;
  },
};
