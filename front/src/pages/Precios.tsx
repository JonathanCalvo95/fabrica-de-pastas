import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import axios from "axios";
import { useNavigate, useParams, Navigate } from "react-router-dom";

/* ===== Tipos del back ===== */
type ProductoDto = {
  id: string;
  nombre: string;
  precio: number | string;
  categoria: string;
  activo?: boolean;
};

/* ===== Helpers ===== */
const money = (v: number | string) =>
  typeof v === "string"
    ? v
    : v.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      });

const mapDto = (p: ProductoDto) => ({
  categoria: (p.categoria || "SIN CATEGORÍA").trim(),
  name: (p.nombre || "").trim(),
  price: money(p.precio),
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ===== UI ===== */
function Fila({
  name,
  price,
  last,
}: {
  name: string;
  price: string;
  last?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 72px",
        alignItems: "center",
        minHeight: 36,
        px: 2,
        borderBottom: last ? "none" : "2px solid #b33a3a",
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 13, md: 14, lg: 15 },
          color: "#a01818",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".6px",
          pr: 1,
          lineHeight: 1.15,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </Typography>

      <Box
        sx={{
          justifySelf: "end",
          background: "#8e1a1a", // bordó
          color: "#fff",
          borderRadius: "2px",
          px: 1.2,
          py: 0.4,
          minWidth: 64,
          textAlign: "center",
          fontWeight: 900,
          boxShadow:
            "inset 0 -1px 0 rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.15)",
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: { xs: 12, md: 13 }, fontWeight: 900 }}
        >
          {price}
        </Typography>
      </Box>
    </Box>
  );
}

function Tablero({
  name,
  subtitle,
  productos,
}: {
  name: string;
  subtitle?: string;
  productos: { name: string; price: string }[];
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        border: "8px solid #6b3f2b",
        borderRadius: "4px",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          background: "#5a3a2b",
          color: "#fff",
          px: 2,
          py: 1,
          borderBottom: "3px solid #6b3f2b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontWeight: 900, letterSpacing: 1.6, fontSize: 16 }}>
          {name}
        </Typography>
        <Box
          sx={{
            background: "#8e1a1a",
            color: "#fff",
            fontWeight: 900,
            fontSize: 10,
            px: 0.8,
            py: 0.2,
            borderRadius: "2px",
          }}
        >
          KG
        </Box>
      </Box>

      {subtitle && (
        <Box
          sx={{
            background: "#f3eee9",
            color: "#5a3a2b",
            px: 2,
            py: 0.8,
            borderBottom: "2px solid #b17e6a",
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              fontSize: 12,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      )}

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
            last={i === productos.length - 1}
          />
        ))}
      </Box>
    </Paper>
  );
}

/* ===== Página ===== */
export default function PreciosPantallas() {
  const { n } = useParams(); // "/precio:n"
  const pageFromUrl = Math.max(1, Number(n || 1)); // 1-based
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<
    { name: string; productos: { name: string; price: string }[] }[][]
  >([]);
  const navigate = useNavigate();

  // Fetch y armado de páginas (2 por página)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const { data } = await axios.get<ProductoDto[]>("/api/Productos", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const activos = (data ?? []).filter((d) => d.activo !== false);
        // agrupar por categoría preservando orden
        const buckets = new Map<string, { name: string; price: string }[]>();
        for (const dto of activos) {
          const m = mapDto(dto);
          if (!buckets.has(m.categoria)) buckets.set(m.categoria, []);
          buckets.get(m.categoria)!.push({ name: m.name, price: m.price });
        }
        const categorias = Array.from(buckets, ([name, productos]) => ({
          name,
          productos,
        }));
        const grouped = chunk(categorias, 2); // <-- DOS por página

        if (alive) setPages(grouped);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const maxPage = Math.max(1, pages.length); // 1-based total

  // si la URL pide una página inexistente, redirijo a la última válida
  if (!loading && (pageFromUrl < 1 || pageFromUrl > maxPage)) {
    return (
      <Navigate
        to={`/precio${Math.min(Math.max(pageFromUrl, 1), maxPage)}`}
        replace
      />
    );
  }

  const current = pages[pageFromUrl - 1];

  const go = useCallback(
    (target: number) => {
      const next = ((target - 1 + maxPage) % maxPage) + 1; // wrap 1..max
      navigate(`/precio${next}`, { replace: true });
    },
    [navigate, maxPage]
  );

  // teclas ← / →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(pageFromUrl - 1);
      if (e.key === "ArrowRight") go(pageFromUrl + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, pageFromUrl]);

  return (
    <Box
      sx={{ minHeight: "100dvh", bgcolor: "#efe6d2", p: { xs: 1.5, md: 3 } }}
    >
      {/* Controles */}
      {!loading && maxPage > 1 && (
        <Box
          sx={{
            position: "fixed",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <IconButton
            onClick={() => go(pageFromUrl - 1)}
            sx={{ pointerEvents: "auto", bgcolor: "rgba(0,0,0,.1)" }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton
            onClick={() => go(pageFromUrl + 1)}
            sx={{ pointerEvents: "auto", bgcolor: "rgba(0,0,0,.1)" }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}

      {/* Contenido */}
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
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" }, // siempre 2 en desktop
            alignItems: "stretch",
          }}
        >
          {current?.map((c) => (
            <Tablero key={c.name} name={c.name} productos={c.productos} />
          ))}
        </Box>
      )}
    </Box>
  );
}
