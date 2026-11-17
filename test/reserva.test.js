const { test } = require("node:test");
const assert = require("node:assert");
const { leerReserva, leerFechaReserva } = require("../logica.js");

const HOY = "2026-11-17";

const booking = `¡Tu reserva en Hotel Gion Kioto está confirmada!
Número de confirmación: 4123.556.789
Entrada
mié, 14 de enero de 2027 (desde las 15:00)
Salida
sáb, 17 de enero de 2027 (hasta las 11:00)
3 noches, 1 habitación
Subtotal ¥ 76.000
Impuestos ¥ 8.000
Precio total ¥ 84.000
Pagarás en el alojamiento. No se te cobrará nada ahora.`;

const airbnb = `Reserva confirmada para Lisboa
Your stay at Casa do Alfama is confirmed
Check-in: Fri, Mar 5
Checkout: Mon, Mar 8
Total (EUR) €412.50
Paid`;

const hotel = `Dear guest, thank you for your booking.
Arrival: 22/12/2026
Departure: 26/12/2026
Room rate: $180.00 per night
Total amount: $810.00
Payment at the hotel on arrival.`;

test("el de Booking: nombre, el total y no el subtotal, noches, fechas y que se paga allí", () => {
  assert.deepEqual(leerReserva(booking, HOY), {
    nombre: "Hotel Gion Kioto", cantidad: 84000, divisa: "JPY", noches: 3,
    entrada: "2027-01-14", salida: "2027-01-17", aPagar: true,
  });
});

test("el de Airbnb, en inglés, pagado y sin año en las fechas", () => {
  assert.deepEqual(leerReserva(airbnb, HOY), {
    nombre: "Casa do Alfama", cantidad: 412.5, divisa: "EUR", noches: 3,
    entrada: "2027-03-05", salida: "2027-03-08", aPagar: false,
  });
});

test("el de un hotel sin nombre claro: las noches por las fechas", () => {
  const r = leerReserva(hotel, HOY);
  assert.equal(r.nombre, null);
  assert.equal(r.cantidad, 810);
  assert.equal(r.divisa, "USD");
  assert.equal(r.noches, 4);
  assert.equal(r.aPagar, true);
});

test("lo que no es una reserva se pega como siempre", () => {
  assert.equal(leerReserva("Hola, quedamos a las 20:00 en el bar.\nTraed 20 €.\nVale", HOY), null);
  assert.equal(leerReserva("Reserva confirmada\nHotel Sol\nSin precio en ningún sitio, ya te lo diremos", HOY), null);
  assert.equal(leerReserva("12,50 €", HOY), null);
  assert.equal(leerReserva(null, HOY), null);
});

test("las fechas en sus formas", () => {
  assert.equal(leerFechaReserva("2027-01-14", HOY), "2027-01-14");
  assert.equal(leerFechaReserva("mié, 14 de enero de 2027", HOY), "2027-01-14");
  assert.equal(leerFechaReserva("14 ene 2027", HOY), "2027-01-14");
  assert.equal(leerFechaReserva("Thu, Jan 14, 2027", HOY), "2027-01-14");
  assert.equal(leerFechaReserva("14/01/27", HOY), "2027-01-14");
  // Sin año, el próximo: diciembre es de este y marzo del que viene.
  assert.equal(leerFechaReserva("20 dic", HOY), "2026-12-20");
  assert.equal(leerFechaReserva("Mar 5", HOY), "2027-03-05");
  assert.equal(leerFechaReserva("cuando puedas", HOY), null);
});
