import db from "../database";
import generateInsertedFields from "../utils/generateInsertedFields";
import { checkNumber, setOptionalUpdate } from "../utils/sqlValidations";

// db.prepare("DROP TABLE IF EXISTS papers").run();

const createPapersTableStatment = db.prepare(`
  CREATE TABLE IF NOT EXISTS papers(
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('transaction', 'expense')),
  purchased_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seller_id INTEGER NOT NULL,
  car_id INTEGER NOT NULL UNIQUE,
  price INTEGER DEFAULT 0 ${checkNumber("price")},
  deal_id INTEGER,
  issue_date TEXT NOT NULL,
  received_at TEXT,
  expiration_date TEXT AS (DATETIME(issue_date, '+3 years')) STORED,
  has_received INTEGER AS (CASE WHEN received_at IS NOT NULL THEN 1 ELSE 0 END) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id)
   REFERENCES clients (id)
     ON UPDATE NO ACTION
     ON DELETE CASCADE
  FOREIGN KEY (car_id)
   REFERENCES cars (id)
     ON UPDATE NO ACTION
     ON DELETE CASCADE
  FOREIGN KEY (deal_id)
    REFERENCES expenses (id)
     ON UPDATE NO ACTION
     ON DELETE CASCADE
  )`);

createPapersTableStatment.run();

export const IS_PAPER_EXPIRATED = `
  CASE
    WHEN datetime('now') > papers.expiration_date THEN 1
    ELSE 0
  END AS is_expirated
  `;

export const selectPapersQuery = `
  SELECT papers.*,
  ${IS_PAPER_EXPIRATED},
  clients.full_name AS seller,
  ( cars.name || ' (' || cars.serial_number || ')' ) AS car,
  owners.id AS owner_id,
  owners.full_name AS owner
  FROM papers
  INNER JOIN clients ON clients.id = papers.seller_id
  INNER JOIN cars ON cars.id = papers.car_id
  LEFT JOIN clients AS owners ON owners.id = cars.buyer_id

  `;

export const selectPaperByIdStatment = db.prepare(`
  ${selectPapersQuery}
  WHERE papers.id = ?
  `);

export const selectPaperByCarIdStatment = db.prepare(`
  ${selectPapersQuery}
  WHERE papers.car_id = ?
  `);

const INSERTED_FIELDS = generateInsertedFields([
  "type",
  "purchased_at",
  "seller_id",
  "car_id",
  "price",
  "deal_id",
  "issue_date",
  "received_at",
]);

export const insertPaperStatment = db.prepare(`
  INSERT INTO papers
  ${INSERTED_FIELDS}
  `);

export const updatePaperStatment = db.prepare(`
  UPDATE papers
  SET ${setOptionalUpdate("type")},
    ${setOptionalUpdate("purchased_at")},
    ${setOptionalUpdate("seller_id")},
    ${setOptionalUpdate("price")},
    deal_id = ?,
    ${setOptionalUpdate("issue_date")},
    received_at = ?,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ? 
  `);

export const resetPaperDealIdStatment = db.prepare(`
  UPDATE papers
  SET deal_id = null,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ? 
  `);

export const deletePapersByIdQuery = `DELETE FROM papers WHERE id IN `;

export const deletePapersStatment = db.prepare(`DELETE FROM papers`);

const deletePapersRelatedRecords = db.prepare(`
  CREATE TRIGGER IF NOT EXISTS delete_papers_related_records
  AFTER DELETE ON papers
  FOR EACH ROW
  BEGIN
    DELETE FROM expenses
    WHERE id = OLD.deal_id AND OLD.type = 'expense';

    DELETE FROM transactions
    WHERE type = 'paper' AND product_id = OLD.id AND OLD.type = 'transaction';
  END;
  `);

const toggleCarGrayCardOnInsert = db.prepare(`
  CREATE TRIGGER IF NOT EXISTS toggle_car_gray_card_on_insert
  AFTER INSERT ON papers
  FOR EACH ROW
  BEGIN
    UPDATE cars
    SET gray_card_received = NEW.has_received
    WHERE cars.id = NEW.car_id ;
  END;
  `);

const toggleCarGrayCardOnUpdate = db.prepare(`
  CREATE TRIGGER IF NOT EXISTS toggle_car_gray_card_on_update
  AFTER UPDATE ON papers
  FOR EACH ROW
  BEGIN
    UPDATE cars
    SET gray_card_received = NEW.has_received
    WHERE cars.id = NEW.car_id ;
  END;
  `);

const toggleCarGrayCardonOnDelete = db.prepare(`
  CREATE TRIGGER IF NOT EXISTS toggle_car_gray_card_on_delete
  AFTER DELETE ON papers
  FOR EACH ROW
  BEGIN
    UPDATE cars
    SET gray_card_received = null
    WHERE cars.id = OLD.car_id ;
  END;
  `);

deletePapersRelatedRecords.run();
toggleCarGrayCardOnInsert.run();
toggleCarGrayCardOnUpdate.run();
toggleCarGrayCardonOnDelete.run();