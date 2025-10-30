import { useEffect, useState, useCallback, useRef } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { categoriaLabel } from "../utils/enums";
import { get, type Producto } from "../api/productos";

/* ===== Config ===== */
const REFRESH_MS = 45_000; // intervalo de actualización (ms)

/* ===== Helpers ===== */
const money = (v: number | string) =>
  typeof v === "string"
    ? v
    : v.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      });

type RowStatus = "ok" | "low" | "out";

const mapDto = (p: Producto) => {
  const status: RowStatus =
    p.stock <= 0 ? "out" : p.stock < (p.stockMinimo ?? 0) ? "low" : "ok";
  return {
    categoria: categoriaLabel(p.categoria),
    name: (p.descripcion || "").trim(),
    price: money(p.precio),
    status,
    _sig: `${p.id}|${p.precio}|${p.stock}|${p.stockMinimo}|${p.activo}|${p.fechaActualizacion}`,
  };
};

/* Crea una firma de todo el dataset para evitar renders si no hay cambios */
function signatureOf(mapped: ReturnType<typeof mapDto>[]) {
  // Ordenamos por categoria+name para que la firma sea estable
  const sorted = [...mapped].sort((a, b) =>
    (a.categoria + a.name).localeCompare(b.categoria + b.name)
  );
  return sorted.map((x) => x._sig).join("§");
}

/* ===== Agrupación lógica de categorías en pantallas ===== */
const GRUPOS_PANTALLAS: number[][] = [
  [1, 2, 3], // Ravioles, Canelones, Agnolottis
  [4, 5], // Tallarines, Ñoquis
  [6, 7, 8, 9, 10, 11, 13, 15], // Sorrentinos, Capelettis, Tortellettis, Salsas, Tartas, Postres, Empanadas
];

/* ===== UI ===== */
function StatusPill({ status }: { status: RowStatus }) {
  if (status === "ok") return null;
  const cfg =
    status === "out"
      ? { bg: "#ffdede", bd: "#d32f2f", fg: "#b71c1c", text: "SIN STOCK" }
      : { bg: "#fff1da", bd: "#ef6c00", fg: "#e65100", text: "STOCK BAJO" };
  return (
    <Box
      component="span"
      sx={{
        ml: 1,
        px: 0.7,
        py: 0.1,
        borderRadius: "4px",
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 0.3,
        color: cfg.fg,
        background: cfg.bg,
        border: `1px solid ${cfg.bd}`,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.text}
    </Box>
  );
}

function Fila({
  name,
  price,
  status,
  last,
}: {
  name: string;
  price: string;
  status: RowStatus;
  last?: boolean;
}) {
  const priceColor = status === "out" ? "#9e9e9e" : "#8e1a1a";
  const nameStyle =
    status === "out"
      ? {
          color: "#777",
          textDecoration: "line-through",
          opacity: 0.8,
        }
      : status === "low"
        ? { color: "#b95b00" }
        : { color: "#a01818" };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 88px",
        alignItems: "center",
        minHeight: 36,
        px: 2,
        borderBottom: last ? "none" : "2px solid #3E2723",
        gap: 1,
      }}
    >
      <Box sx={{ minWidth: 0, display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: { xs: 13, md: 14, lg: 15 },
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: ".6px",
            pr: 1,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ...nameStyle,
          }}
          title={name}
        >
          {name}
        </Typography>
        <StatusPill status={status} />
      </Box>

      <Box
        sx={{
          justifySelf: "end",
          color: priceColor,
          opacity: status === "out" ? 0.75 : 1,
        }}
        title={price}
      >
        <Typography sx={{ fontSize: { md: 15 }, fontWeight: 900 }}>
          {price}
        </Typography>
      </Box>
    </Box>
  );
}

function Tablero({
  name,
  productos,
}: {
  name: string;
  productos: { name: string; price: string; status: RowStatus }[];
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "4px solid #3E2723",
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "#FAFAFA",
        height: "100%",
      }}
    >
      <Box
        sx={{
          background: "#3E2723",
          color: "#fff",
          px: 2,
          py: 1,
          borderBottom: "3px solid #3E2723",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontWeight: 900, letterSpacing: 1.6, fontSize: 16 }}>
          {name}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          background:
            "repeating-linear-gradient(to bottom,#ffffff 0px,#ffffff 34px,#ffeaea 35px)",
        }}
      >
        {productos.map((p, i) => (
          <Fila
            key={p.name + i}
            name={p.name}
            price={p.price}
            status={p.status}
            last={i === productos.length - 1}
          />
        ))}
      </Box>
    </Paper>
  );
}

/* ===== Página ===== */
export default function Precios() {
  const { n } = useParams();
  const pageFromUrl = Math.max(1, Number(n || 1));
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<
    {
      name: string;
      productos: { name: string; price: string; status: RowStatus }[];
    }[][]
  >([]);
  const navigate = useNavigate();

  const lastSig = useRef<string>(""); // firma de último dataset
  const aliveRef = useRef(true);

  const buildPages = useCallback((mapped: ReturnType<typeof mapDto>[]) => {
    // agrupar por categoría
    const buckets = new Map<
      string,
      { name: string; price: string; status: RowStatus }[]
    >();
    for (const m of mapped) {
      if (!buckets.has(m.categoria)) buckets.set(m.categoria, []);
      buckets.get(m.categoria)!.push({
        name: m.name,
        price: m.price,
        status: m.status,
      });
    }
    // construir páginas en base a GRUPOS_PANTALLAS
    const pagesBuilt = GRUPOS_PANTALLAS.map((grupo) =>
      grupo
        .map((catId) => categoriaLabel(catId))
        .filter((n) => buckets.has(n))
        .map((n) => ({ name: n, productos: buckets.get(n)! }))
    );
    return pagesBuilt;
  }, []);

  const fetchAndMaybeUpdate = useCallback(async () => {
    try {
      const data = await get();
      const activos = (data ?? []).filter((d) => d.activo !== false);
      const mapped = activos.map(mapDto);
      const sig = signatureOf(mapped);
      if (sig !== lastSig.current) {
        lastSig.current = sig;
        if (aliveRef.current) setPages(buildPages(mapped));
      }
    } catch {
      // silencioso; próximo tick volverá a intentar
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [buildPages]);

  // Primera carga
  useEffect(() => {
    aliveRef.current = true;
    setLoading(true);
    fetchAndMaybeUpdate();
    return () => {
      aliveRef.current = false;
    };
  }, [fetchAndMaybeUpdate]);

  // Polling periódico
  useEffect(() => {
    const id = window.setInterval(fetchAndMaybeUpdate, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [fetchAndMaybeUpdate]);

  // Refetch al volver al foco (cuando la pestaña vuelve a estar visible)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") fetchAndMaybeUpdate();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [fetchAndMaybeUpdate]);

  const maxPage = Math.max(1, pages.length);
  const current = pages[pageFromUrl - 1];

  const go = useCallback(
    (target: number) => {
      const next = ((target - 1 + maxPage) % maxPage) + 1;
      navigate(`/precio/${next}`, { replace: true });
    },
    [navigate, maxPage]
  );

  // Atajos de teclado: ← → y F (pantalla completa)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(pageFromUrl - 1);
      if (e.key === "ArrowRight") go(pageFromUrl + 1);
      if (e.key.toLowerCase() === "f") {
        const elem = document.documentElement;
        if (!document.fullscreenElement) elem.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
      if (e.key.toLowerCase() === "r") {
        // refresh manual
        fetchAndMaybeUpdate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, pageFromUrl, fetchAndMaybeUpdate]);

  if (!loading && (pageFromUrl < 1 || pageFromUrl > maxPage)) {
    return <Navigate to={`/precio/1`} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#f3e8c9",
        p: { xs: 1.5, md: 3 },
      }}
    >
      {loading ? (
        <Box sx={{ height: "80dvh", display: "grid", placeItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#5a3a2b" }}>
            Cargando precios…
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            height: "100%",
            maxWidth: 1600,
            mx: "auto",
            display: "grid",
            gap: { xs: 1.5, md: 3 },
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" },
            alignItems: "stretch",
          }}
        >
          {current?.map((c) => (
            <Tablero
              key={c.name}
              name={c.name.toLocaleUpperCase()}
              productos={c.productos}
            />
          ))}
        </Box>
      )}

      {/* Botón pantalla completa */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 50,
        }}
      >
        <button
          onClick={() => {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
              elem.requestFullscreen?.();
            } else {
              document.exitFullscreen?.();
            }
          }}
          style={{
            background: "#8e1a1a",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            fontSize: "22px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
          title="Pantalla completa (tecla F) — Refrescar (tecla R)"
        >
          ⛶
        </button>
      </Box>
    </Box>
  );
}
