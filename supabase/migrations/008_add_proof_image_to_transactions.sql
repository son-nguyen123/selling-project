-- Migration 008: Add proof_image column to transactions for deposit verification
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS proof_image TEXT;
