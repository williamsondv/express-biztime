const db = require("../db");
const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");

router.get("/", async (req, res) => {
  const results = await db.query(
    "SELECT code, industry FROM industries ORDER BY code"
  );
  return res.json(results.rows);
});

router.post("/", async (req, res) => {
  try {
    const { code, industry } = req.body;

    const results = await db.query(
      `INSERT INTO industries (code,industry) VALUES($1,$2) RETURNING code, industry`,
      [code, industry]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.post("/:comp_code/:industry_code", async (req, res) => {
  try {
    const comp_code = req.params.comp_code;
    const industry_code = req.params.industry_code;

    const results = await db.query(
      `INSERT INTO companies_industries (comp_code,industry_code) VALUES($1,$2) RETURNING comp_code, industry_code`,
      [comp_code, industry_code]
    );
    return res.status(201).json({ company_industry: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
