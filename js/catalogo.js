/* =========================================================
   MUNDO PLAST — Catálogo de productos
   1. Lee los productos de data/productos.json
   2. Crea los botones de categorías
   3. Crea una tarjeta por producto con botón de WhatsApp
   ========================================================= */

// ---------- Configuración ----------
const WHATSAPP = "595985345757";   // Formato internacional, sin + ni 0 inicial
const MOSTRAR_PRECIOS = true;       // false = muestra "Consultar precio"

// Aquí guardaremos los productos cuando se carguen
let productos = [];


// ---------- Funciones de ayuda ----------

// 45000 -> "Gs. 45.000"
function formatearPrecio(precio) {
  return "Gs. " + precio.toLocaleString("es-PY");
}

// Crea el enlace de WhatsApp con el mensaje ya escrito
function enlaceWhatsApp(producto) {
  const mensaje = `Hola Mundo Plast, me interesa: ${producto.nombre} (código ${producto.codigo}). ¿Está disponible?`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}


// ---------- Crear una tarjeta ----------

function crearTarjeta(producto) {
  const precio = MOSTRAR_PRECIOS
    ? formatearPrecio(producto.precio)
    : "Consultar precio";

  return `
    <article class="tarjeta">
      <img
        src="img/productos/${producto.foto}"
        alt="${producto.nombre}"
        loading="lazy"
        onerror="this.onerror=null; this.src='img/placeholder.svg';">
      <div class="tarjeta__cuerpo">
        <span class="tarjeta__categoria">${producto.categoria}</span>
        <h3 class="tarjeta__nombre">${producto.nombre}</h3>
        <p class="tarjeta__descripcion">${producto.descripcion}</p>
        <p class="tarjeta__precio">${precio}</p>
        <a href="${enlaceWhatsApp(producto)}" class="boton boton--whatsapp tarjeta__boton"
           target="_blank" rel="noopener">
          Pedir por WhatsApp
        </a>
      </div>
    </article>
  `;
}


// ---------- Mostrar productos (todos o de una categoría) ----------

function mostrarProductos(categoria) {
  const contenedor = document.getElementById("productos");

  const lista = categoria === "Todos"
    ? productos
    : productos.filter(p => p.categoria === categoria);

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="aviso">No hay productos en esta categoría.</p>`;
    return;
  }

  contenedor.innerHTML = lista.map(crearTarjeta).join("");
}


// ---------- Crear los botones de categorías ----------

function crearFiltros() {
  const contenedor = document.getElementById("filtros");

  // Saca las categorías sin repetir: ["Todos", "Bazar", "Cotillón", ...]
  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria))];

  contenedor.innerHTML = categorias
    .map(cat => `<button class="filtro" data-categoria="${cat}">${cat}</button>`)
    .join("");

  // Marca "Todos" como activo al empezar
  contenedor.querySelector(".filtro").classList.add("filtro--activo");

  // Un solo "escuchador" para todos los botones
  contenedor.addEventListener("click", evento => {
    const boton = evento.target.closest(".filtro");
    if (!boton) return;

    contenedor.querySelectorAll(".filtro").forEach(b => b.classList.remove("filtro--activo"));
    boton.classList.add("filtro--activo");

    mostrarProductos(boton.dataset.categoria);
  });
}


// ---------- Cargar los productos del archivo JSON ----------

async function cargarProductos() {
  try {
    const respuesta = await fetch("data/productos.json");
    if (!respuesta.ok) throw new Error("No se encontró productos.json");

    productos = await respuesta.json();

    // Los destacados primero
    productos.sort((a, b) => Number(b.destacado) - Number(a.destacado));

    crearFiltros();
    mostrarProductos("Todos");

  } catch (error) {
    console.error(error);
    document.getElementById("productos").innerHTML =
      `<p class="aviso">No se pudieron cargar los productos. ¿Abriste la web con Live Server?</p>`;
  }
}


// ---------- Arranque ----------
cargarProductos();