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

    // ── Sellers ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS sellers (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name     VARCHAR(255)  NOT NULL,
        store_name    VARCHAR(255)  NOT NULL,
        email         VARCHAR(255)  UNIQUE NOT NULL,
        password_hash VARCHAR(255)  NOT NULL,
        is_verified   BOOLEAN       DEFAULT FALSE,
        created_at    TIMESTAMPTZ   DEFAULT NOW(),
        updated_at    TIMESTAMPTZ   DEFAULT NOW()
      );
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS sellers_updated_at ON sellers;
      CREATE TRIGGER sellers_updated_at
        BEFORE UPDATE ON sellers
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);

    // ── Products ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
        seller_id      UUID         NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        name           VARCHAR(255) NOT NULL,
        brand          VARCHAR(255) NOT NULL,
        description    TEXT,
        price          DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category       VARCHAR(100) NOT NULL,
        badge          VARCHAR(50),
        try_on         BOOLEAN      DEFAULT FALSE,
        sizes          JSONB        NOT NULL DEFAULT '[]',
        colors         JSONB        NOT NULL DEFAULT '[]',
        stock          INTEGER      NOT NULL DEFAULT 0,
        material       VARCHAR(255),
        fit            VARCHAR(255),
        care           VARCHAR(255),
        origin         VARCHAR(255),
        rating         DECIMAL(3,2) DEFAULT 0,
        review_count   INTEGER      DEFAULT 0,
        is_active      BOOLEAN      DEFAULT TRUE,
        created_at     TIMESTAMPTZ  DEFAULT NOW(),
        updated_at     TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS products_updated_at ON products;
      CREATE TRIGGER products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);

    // Add product detail columns if they don't exist (safe for existing tables)
    for (const col of ['material', 'fit', 'care', 'origin']) {
      await client.query(`
        ALTER TABLE products ADD COLUMN IF NOT EXISTS ${col} VARCHAR(255);
      `);
    }

    // ── Product Images ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id  UUID    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url         TEXT    NOT NULL,
        public_id   TEXT    NOT NULL,
        color       VARCHAR(20),
        is_primary  BOOLEAN DEFAULT FALSE,
        sort_order  INTEGER DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color VARCHAR(20);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_seller  ON products(seller_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
    `);

    // ── Wishlists ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
    `);

    // ── Orders ────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        address_snapshot JSONB        NOT NULL,
        total_amount     DECIMAL(10,2) NOT NULL,
        payment_method   VARCHAR(50)  NOT NULL DEFAULT 'cod',
        status           VARCHAR(50)  NOT NULL DEFAULT 'pending',
        created_at       TIMESTAMPTZ  DEFAULT NOW(),
        updated_at       TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS orders_updated_at ON orders;
      CREATE TRIGGER orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);

    // ── Order Items ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id          UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id        UUID         REFERENCES products(id) ON DELETE SET NULL,
        seller_id         UUID         NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        product_name      VARCHAR(255) NOT NULL,
        product_brand     VARCHAR(255) NOT NULL,
        product_image_url TEXT,
        size              VARCHAR(50),
        color             VARCHAR(50),
        quantity          INTEGER      NOT NULL DEFAULT 1,
        unit_price        DECIMAL(10,2) NOT NULL,
        created_at        TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user     ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);
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
