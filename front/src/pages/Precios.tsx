import { useEffect, useState, useCallback, useRef } from "react";
import { Box, Typography, Paper, Chip, IconButton, Card, CardContent, CircularProgress } from "@mui/material";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { categoriaLabel } from "../utils/enums";
import { get, type Producto } from "../api/productos";
import { ArrowBack, Fullscreen, FullscreenExit } from "@mui/icons-material";

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
  
  return (
    <Chip
      label={status === "out" ? "SIN STOCK" : "STOCK BAJO"}
      color={status === "out" ? "error" : "warning"}
      size="small"
      sx={{
        ml: 1,
        height: 20,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    />
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
  const isDisabled = status === "out";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.5,
        px: 2,
        borderBottom: last ? "none" : "1px solid",
        borderColor: "divider",
        "&:hover": {
          bgcolor: "action.hover",
        },
        opacity: isDisabled ? 0.6 : 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            textDecoration: isDisabled ? "line-through" : "none",
            color: status === "low" ? "warning.dark" : "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={name}
        >
          {name}
        </Typography>
        <StatusPill status={status} />
      </Box>

      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 700,
          color: isDisabled ? "text.disabled" : "primary.main",
          ml: 2,
          whiteSpace: "nowrap",
        }}
      >
        {price}
      </Typography>
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
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 0.5,
          }}
        >
          {name}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          bgcolor: "background.paper",
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
    </Card>
  );
}

/* ===== Página ===== */
export default function Precios() {
  const { n } = useParams();
  const pageFromUrl = Math.max(1, Number(n || 1));
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pages, setPages] = useState<
    {
      name: string;
      productos: { name: string; price: string; status: RowStatus }[];
    }[][]
  >([]);
  const navigate = useNavigate();

  const lastSig = useRef<string>("");
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
      navigate(`/precios/${next}`, { replace: true });
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
        if (!document.fullscreenElement) {
          elem.requestFullscreen?.();
          setIsFullscreen(true);
        } else {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        }
      }
      if (e.key.toLowerCase() === "r") {
        // refresh manual
        fetchAndMaybeUpdate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, pageFromUrl, fetchAndMaybeUpdate]);

  // Escuchar cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!loading && (pageFromUrl < 1 || pageFromUrl > maxPage)) {
    return <Navigate to={`/precios/1`} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, md: 4 },
        position: "relative",
        overflow: "hidden",

        // Fondos decorativos
        "&::before": {
          content: '""',
          position: "fixed",
          pointerEvents: "none",
          width: 800,
          height: 800,
          borderRadius: "50%",
          top: -300,
          left: -200,
          background: (t) =>
            `radial-gradient(circle at center, ${t.palette.primary.main}20 0%, transparent 70%)`,
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "fixed",
          pointerEvents: "none",
          width: 700,
          height: 700,
          borderRadius: "50%",
          bottom: -250,
          right: -150,
          background: (t) =>
            `radial-gradient(circle at center, ${t.palette.secondary.main}30 0%, transparent 70%)`,
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ maxWidth: 1600, mx: "auto", position: "relative", zIndex: 1 }}>
        {/* Header con título */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h1"
              sx={{ mb: 0.5, letterSpacing: -0.3, fontWeight: 700 }}
            >
              Lista de Precios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Consulta nuestros productos y disponibilidad
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => navigate("/")}
              color="primary"
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
              title="Volver al inicio"
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={() => {
                const elem = document.documentElement;
                if (!document.fullscreenElement) {
                  elem.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
              }}
              color="primary"
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
              title="Pantalla completa (tecla F)"
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Box>
        </Box>

        {loading ? (
          <Box
            sx={{
              height: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary">
              Cargando precios…
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" },
              alignItems: "stretch",
            }}
          >
            {current?.map((c) => (
              <Tablero
                key={c.name}
                name={c.name.toUpperCase()}
                productos={c.productos}
              />
            ))}
          </Box>
        )}

        {/* Indicador de página */}
        {!loading && maxPage > 1 && (
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "center",
              gap: 1,
            }}
          >
            {Array.from({ length: maxPage }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: i + 1 === pageFromUrl ? "primary.main" : "divider",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: i + 1 === pageFromUrl ? "primary.dark" : "action.hover",
                  },
                }}
                onClick={() => navigate(`/precios/${i + 1}`)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}