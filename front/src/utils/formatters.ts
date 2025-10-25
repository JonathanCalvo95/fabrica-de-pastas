import { categoriaLabel } from "../utils/enums";

export const formatName = (
  categoria?: number,
  descripcion?: string
): string => {
  const categoriaText = categoriaLabel(categoria ?? 0);
  const desc = descripcion?.trim() || "";
  return `${categoriaText} - ${desc}`;
};
