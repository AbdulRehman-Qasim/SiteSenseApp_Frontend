// backend/server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create PaymentIntent endpoint
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency, planName } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in smallest currency unit (e.g., cents)
      currency,
      description: `Subscription Plan: ${planName}`,
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
