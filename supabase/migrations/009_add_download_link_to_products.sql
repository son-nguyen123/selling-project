-- Add download_link column to store_products table
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS download_link TEXT;
