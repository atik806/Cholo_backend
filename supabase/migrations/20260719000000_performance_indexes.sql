-- =====================================================
-- Migration: Performance Indexes
-- Adds missing indexes for query optimization
-- =====================================================

-- Composite index for filtered + sorted product queries
CREATE INDEX IF NOT EXISTS idx_products_category_price
  ON products(category_id, price);

CREATE INDEX IF NOT EXISTS idx_products_category_created
  ON products(category_id, created_at DESC);

-- GIN index for tag array lookups
CREATE INDEX IF NOT EXISTS idx_products_tags
  ON products USING GIN(tags);

-- Dashboard/listing order queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at
  ON reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON profiles(created_at DESC);

-- Wishlist product lookups
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id
  ON wishlists(product_id);

-- Report filtering
CREATE INDEX IF NOT EXISTS idx_bug_reports_priority
  ON bug_reports(priority);
