import db from "../database";
import generateInsertedFields from "../utils/generateInsertedFields";
import { checkNumber, setOptionalUpdate } from "../utils/sqlValidations";

// db.prepare("DROP TABLE IF EXISTS clients").run();

const createClientsTableStatment = db.prepare(`
  CREATE TABLE IF NOT EXISTS clients(
    id INTEGER NOT NULL PRIMARY KEY,
    full_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    phone TEXT COLLATE NOCASE,
    email TEXT COLLATE NOCASE,
    address TEXT,
    eur_balance NUMERIC NOT NULL DEFAULT 0 ${checkNumber("eur_balance")},
    dzd_balance NUMERIC NOT NULL DEFAULT 0 ${checkNumber("dzd_balance")},
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

createClientsTableStatment.run();

export const selectClientsListStatment = db.prepare(`
  SELECT 
  id,
  full_name
  FROM clients
  `);

export const selectClientsQuery = `
  SELECT clients.*,
  t.last_transaction_date
  FROM clients 
  LEFT JOIN (
    SELECT
    client_id,
    MAX(transaction_date) AS last_transaction_date
    FROM transactions
    GROUP BY client_id
  ) AS t ON clients.id = t.client_id
  `;

export const selectClientByIdStatment = db.prepare(`
  SELECT * FROM clients
  WHERE id = ?
  `);

export const selectClientTransactionsQuery = `
  SELECT * FROM transactions 
  WHERE client_id = ? --CURRENCY
  ORDER BY transaction_date DESC
  `;

export const selectClientLastTransactionStatment = db.prepare(`
  ${selectClientTransactionsQuery}
  LIMIT 1
  `);

const insertFields = generateInsertedFields(["full_name", "phone", "email", "address", "eur_balance", "dzd_balance"]);

export const insertClientStatment = db.prepare(`
  INSERT INTO clients
  ${insertFields}
  `);

export const updateClientStatment = db.prepare(`
  UPDATE clients
  SET ${setOptionalUpdate("full_name")},
      ${setOptionalUpdate("phone")},
      ${setOptionalUpdate("email")},
      ${setOptionalUpdate("address")},
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
  `);

export const deleteClientsByIdsStatment = `DELETE FROM clients WHERE id IN `;

export const deleteAllClientsStatment = db.prepare(`DELETE FROM clients`);

// db.prepare("DROP TRIGGER update_client_balance_after_insert").run();
// db.prepare("DROP TRIGGER update_client_balance_after_update").run();
// db.prepare("DROP TRIGGER update_client_balance_after_delete").run();

const incrementBalanceQuery = `
  UPDATE clients
    SET dzd_balance = dzd_balance + CASE WHEN NEW.currency = 'DZD' THEN NEW.amount ELSE 0 END,
        eur_balance = eur_balance + CASE WHEN NEW.currency = 'EUR' THEN NEW.amount ELSE 0 END
  WHERE id = NEW.client_id;
  `;
const decrementBalanceQuery = `
  UPDATE clients
  SET dzd_balance = dzd_balance - CASE WHEN OLD.currency = 'DZD' THEN OLD.amount ELSE 0 END,
      eur_balance = eur_balance - CASE WHEN OLD.currency = 'EUR' THEN OLD.amount ELSE 0 END
  WHERE id = OLD.client_id;
  `;

const updateBalanceOnInsert = db.prepare(`
  CREATE TRIGGER IF NOT EXISTS update_client_balance_after_insert
  AFTER INSERT ON transactions
  FOR EACH ROW
  BEGIN
    ${incrementBalanceQuery}
  END;
  `);

const updateBalanceOnUpdate = db.prepare(`
  CREATE TRIGGER IF NOT EXISTS update_client_balance_after_update
  AFTER UPDATE ON transactions
  FOR EACH ROW
  BEGIN
    ${decrementBalanceQuery}
    ${incrementBalanceQuery}
  END;
  `);

const updateBalanceOnDelete = db.prepare(`
  CREATE TRIGGER IF NOT EXISTS update_client_balance_after_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  BEGIN
    ${decrementBalanceQuery}
  END;
  `);

updateBalanceOnInsert.run();
updateBalanceOnUpdate.run();
updateBalanceOnDelete.run();
