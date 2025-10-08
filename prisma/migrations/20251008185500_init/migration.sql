-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "county" TEXT,
    "state_party" TEXT,
    "population" INTEGER,
    "density" INTEGER,
    "cost_of_living" INTEGER,
    "avg_gas_price" DOUBLE PRECISION,
    "sales_tax" DOUBLE PRECISION,
    "income_tax" DOUBLE PRECISION,
    "crime_index" INTEGER,
    "climate_type" TEXT,
    "sunny_days" INTEGER,
    "avg_high_summer" INTEGER,
    "avg_low_winter" INTEGER,
    "avg_rainfall" INTEGER,
    "avg_snowfall" INTEGER,
    "humidity_summer" INTEGER,
    "va_facilities" BOOLEAN NOT NULL DEFAULT false,
    "nearest_va" TEXT,
    "distance_to_va" TEXT,
    "tech_hub" BOOLEAN NOT NULL DEFAULT false,
    "military_hub" BOOLEAN NOT NULL DEFAULT false,
    "marijuana_status" TEXT,
    "lgbtq_rank" INTEGER,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "description" TEXT,
    "extra_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_tags" (
    "location_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "location_tags_pkey" PRIMARY KEY ("location_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_state_city_key" ON "locations"("state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- AddForeignKey
ALTER TABLE "location_tags" ADD CONSTRAINT "location_tags_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_tags" ADD CONSTRAINT "location_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
