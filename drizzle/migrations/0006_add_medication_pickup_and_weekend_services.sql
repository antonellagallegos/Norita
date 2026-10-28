-- Two new services offered on the website. The service list is shared by the form, the admin panel
-- and the CRM (src/lib/leads.ts SERVICES); this keeps the database constraint in line with it.
ALTER TABLE public.leads DROP CONSTRAINT leads_service_interest_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_service_interest_check CHECK (service_interest IN ('Acompañamiento a citas médicas','Neuroestimulación / Gimnasio Mental','Entrenamiento de fuerza','Recogida de medicamentos','Acompañamiento fines de semana','Quiero conocer varios servicios'));
