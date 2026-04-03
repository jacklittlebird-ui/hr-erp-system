
-- Create update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_code TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  engine_number TEXT,
  chassis_number TEXT,
  plate_number TEXT NOT NULL,
  license_start_date DATE,
  license_end_date DATE,
  curtains_license_start DATE,
  curtains_license_end DATE,
  transport_license_start DATE,
  transport_license_end DATE,
  insured_driver_name TEXT,
  insurance_number TEXT,
  station_id UUID REFERENCES public.stations(id),
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle maintenance table
CREATE TABLE public.vehicle_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  description TEXT,
  cost NUMERIC DEFAULT 0,
  maintenance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_maintenance_date DATE,
  odometer_reading INTEGER,
  provider TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance ENABLE ROW LEVEL SECURITY;

-- Vehicles policies
CREATE POLICY "admin_vehicles" ON public.vehicles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hr_vehicles" ON public.vehicles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "read_vehicles" ON public.vehicles FOR SELECT TO authenticated
  USING (true);

-- Vehicle maintenance policies
CREATE POLICY "admin_vehicle_maintenance" ON public.vehicle_maintenance FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hr_vehicle_maintenance" ON public.vehicle_maintenance FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "read_vehicle_maintenance" ON public.vehicle_maintenance FOR SELECT TO authenticated
  USING (true);

-- Update trigger
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_vehicles_plate ON public.vehicles(plate_number);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_license_end ON public.vehicles(license_end_date);
CREATE INDEX idx_vehicle_maintenance_vehicle ON public.vehicle_maintenance(vehicle_id);
CREATE INDEX idx_vehicle_maintenance_date ON public.vehicle_maintenance(maintenance_date);
