-- ClickHouse analytics schema for workshop-registration
-- Database: railway (Railway default)
-- Run once on the Railway ClickHouse instance.

CREATE TABLE IF NOT EXISTS registrations (
    ts            DateTime          DEFAULT now(),
    workshop      LowCardinality(String),
    email         String,
    nume          String,
    telefon       String,
    provocare     String,
    rezultat      String,
    nivel         LowCardinality(String),
    factura       LowCardinality(String),
    status_membru LowCardinality(String),
    suma          LowCardinality(String),
    gdpr          UInt8,
    marketing     UInt8
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(ts)
ORDER BY (workshop, ts);

-- Heartbeat rows auto-expire after 7 days.
CREATE TABLE IF NOT EXISTS heartbeats (
    ts     DateTime DEFAULT now(),
    source LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY ts
TTL ts + INTERVAL 7 DAY;
