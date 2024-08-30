const db = require("../db");
const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");

router.get("/", async (req, res) => {
  const results = await db.query(
    "SELECT code, name FROM companies ORDER BY name"
  );
  return res.json(results.rows);
});

router.get("/:code", async (req, res) => {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description FROM companies WHERE code = $1`,
    [code]
  );

  const invResult = await db.query(
    `SELECT id
     FROM invoices
     WHERE comp_code = $1`,
    [code]
  );

  if (results.rows.length === 0) {
    throw new ExpressError(`No such company: ${code}`, 404);
  }

  const company = compResult.rows[0];
  const invoices = invResult.rows;

  company.invoices = invoices.map((inv) => inv.id);

  return res.json({ company: company });
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)
      RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    let { name, description } = req.body;
    const code = req.params.code;

    const results = await db.query(
      `UPDATE companies 
           SET name=$1, description=$2
           WHERE code=$3
           RETURNING code, name, description`,
      [name, description, code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    } else {
      return res.json({ company: results.rows[0] });
    }
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res) => {
  try {
    let code = req.params.code;

    const results = await db.query(
      `DELETE FROM companies WHERE code=$1 RETURNING code`,
      [code]
    );

    if (results.rows.length == 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    } else {
      return res.json({ status: "deleted" });
    }
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
