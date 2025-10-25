import pluralizeEs from "pluralize-es";

export const pluralAuto = (singular: string, count: number | undefined) =>
  count === 1 ? singular : pluralizeEs(singular);
