require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./database');

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migrations...');

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name    VARCHAR(255)  NOT NULL,
        email        VARCHAR(255)  UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_image_url TEXT,
        is_verified  BOOLEAN       DEFAULT FALSE,
        created_at   TIMESTAMPTZ   DEFAULT NOW(),
        updated_at   TIMESTAMPTZ   DEFAULT NOW()
      );
    `);

    // Auto-update updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS users_updated_at ON users;
      CREATE TRIGGER users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);

    // ── Addresses ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        label         VARCHAR(100) NOT NULL DEFAULT 'Home',
        full_name     VARCHAR(255) NOT NULL,
        phone         VARCHAR(20)  NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city          VARCHAR(100) NOT NULL,
        state         VARCHAR(100) NOT NULL,
        pincode       VARCHAR(20)  NOT NULL,
        country       VARCHAR(100) NOT NULL DEFAULT 'India',
        is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
        created_at    TIMESTAMPTZ  DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS addresses_updated_at ON addresses;
      CREATE TRIGGER addresses_updated_at
        BEFORE UPDATE ON addresses
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);

    console.log('✅ Migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
