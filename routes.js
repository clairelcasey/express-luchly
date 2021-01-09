"use strict";

const { json } = require("body-parser");
/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");
const { BadRequestError } = require("./expressError");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  const customers = await Customer.all();
  const header = 'Customers';
  return res.render("customer_list.html", { customers, header });
});

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.html");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Search for a customer by name. */

router.get("/search/", async function (req, res, next) {
  const searchName = req.query.q;
  console.log('searchName is', searchName);

  const customerMatches = await Customer.search(searchName);
  const header = 'Customer Search Results';
  return res.render("customer_list.html", { customers: customerMatches, header });
});

/** Show list of top X customers by reservation count. */

router.get("/best-customers/", async function (req, res, next) {
  const listSize = Number(req.query.size) || 10;

  // if (isNaN(listSize)) throw new BadRequestError(`Invalid number: ${req.query.size}`);

  const customers = await Customer.getBestCustomers(listSize);
  const header = `Top ${listSize} Customers`;
  return res.render("customer_list.html", { customers, header });
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  const reservations = await customer.getReservations();

  return res.render("customer_detail.html", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  res.render("customer_edit_form.html", { customer });
});

/** Handle editing a customer . */

router.post("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});

module.exports = router;

