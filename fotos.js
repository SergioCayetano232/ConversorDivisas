// Las fotos de los tiques, en IndexedDB y no en storage.local: ahí todo va en
// JSON, y diez fotos se comerían el límite que comparten los viajes.
const fotos = (() => {
  const ALMACEN = "tiques";
  let abierta = null;

  function abrir() {
    abierta ??= new Promise((resolver, fallar) => {
      const peticion = indexedDB.open("conversordivisas", 1);
      peticion.onupgradeneeded = () => peticion.result.createObjectStore(ALMACEN);
      peticion.onsuccess = () => resolver(peticion.result);
      peticion.onerror = () => {
        abierta = null;
        fallar(peticion.error);
      };
    });
    return abierta;
  }

  async function hacer(modo, accion) {
    const db = await abrir();
    return new Promise((resolver, fallar) => {
      const tx = db.transaction(ALMACEN, modo);
      const peticion = accion(tx.objectStore(ALMACEN));
      // Hasta que no acaba la transacción no está escrito de verdad.
      tx.oncomplete = () => resolver(peticion.result);
      tx.onerror = () => fallar(tx.error);
      tx.onabort = () => fallar(tx.error);
    });
  }

  return {
    guardar: (id, blob) => hacer("readwrite", (almacen) => almacen.put(blob, id)),
    leer: (id) => hacer("readonly", (almacen) => almacen.get(id)),
    quitar: (id) => hacer("readwrite", (almacen) => almacen.delete(id)),
    claves: () => hacer("readonly", (almacen) => almacen.getAllKeys()),
  };
})();

// La reduzco antes de guardarla: con la de la cámara tal cual, cada tique serían megas.
async function reducirFoto(archivo) {
  const imagen = await createImageBitmap(archivo);
  const medidas = medidasFoto(imagen.width, imagen.height);
  if (!medidas) throw new Error("La imagen no tiene medidas");
  const lienzo = new OffscreenCanvas(medidas.ancho, medidas.alto);
  lienzo.getContext("2d").drawImage(imagen, 0, 0, medidas.ancho, medidas.alto);
  imagen.close();
  return lienzo.convertToBlob({ type: "image/jpeg", quality: 0.8 });
}
