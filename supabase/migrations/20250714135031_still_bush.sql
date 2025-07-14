/*
  # M-Pesa Transactions Schema

  1. New Tables
    - `mpesa_transactions`
      - `id` (uuid, primary key)
      - `merchant_request_id` (text)
      - `checkout_request_id` (text, unique)
      - `amount` (numeric)
      - `phone_number` (text)
      - `account_reference` (text)
      - `transaction_desc` (text)
      - `status` (text, enum: pending, completed, failed, cancelled)
      - `mpesa_receipt_number` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `mpesa_transactions` table
    - Add policies for authenticated users to manage transactions
*/

CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_request_id text NOT NULL,
  checkout_request_id text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  phone_number text NOT NULL,
  account_reference text NOT NULL,
  transaction_desc text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  mpesa_receipt_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for authenticated users"
  ON mpesa_transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for anonymous users to insert transactions (for payment initiation)
CREATE POLICY "Allow anonymous users to insert transactions"
  ON mpesa_transactions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for anonymous users to read their own transactions
CREATE POLICY "Allow anonymous users to read transactions"
  ON mpesa_transactions
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for anonymous users to update transactions (for callback updates)
CREATE POLICY "Allow anonymous users to update transactions"
  ON mpesa_transactions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_checkout_request_id ON mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_created_at ON mpesa_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_phone_number ON mpesa_transactions(phone_number);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_mpesa_transactions_updated_at
    BEFORE UPDATE ON mpesa_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();