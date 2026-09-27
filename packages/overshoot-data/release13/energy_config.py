"""Explicit series allowlist. Physical quantities, never energy equivalents."""
EIA = [
 ('crude-production','57-1-TBPD','Crude oil production','oil','Production','barrels / day',1000,'Crude oil including lease condensate. The annual value is an average daily rate, not an annual volume.'),
 ('ngl-production','58-1-TBPD','Natural gas liquids production','oil','Natural gas liquids','barrels / day',1000,'Liquids recovered at natural gas processing plants. This is separate from crude oil and is not added to it here.'),
 ('petroleum-consumption','5-2-TBPD','Petroleum and other liquids consumption','oil','Consumption','barrels / day',1000,'A broader product mix than crude oil: petroleum and other liquids. Production and consumption in these views do not form a matched material balance.'),
 ('gasoline-consumption','62-2-TBPD','Motor gasoline consumption','oil','Gasoline use','barrels / day',1000,'Motor gasoline consumption, expressed as an annual average daily rate. This is not a measure of the crude oil input.'),
 ('diesel-consumption','65-2-TBPD','Distillate fuel oil consumption','oil','Distillate use','barrels / day',1000,'Distillate fuel oils include diesel and heating fuels. The quantity is not road diesel alone.'),
 ('jet-consumption','63-2-TBPD','Jet fuel consumption','oil','Jet fuel use','barrels / day',1000,'Jet fuel consumption in the source country account. This is not a flight-level fuel or emissions inventory.'),
 ('gas-production','26-1-BCM','Dry natural gas production','gas','Production','billion m³',1,'Dry natural gas after removal of gas liquids and non-hydrocarbon gases. Annual volume; it is not raw wellhead gas or LNG liquid volume.'),
 ('gas-consumption','26-2-BCM','Dry natural gas consumption','gas','Consumption','billion m³',1,'Annual dry natural gas consumption. Volumes are kept on the publisher’s gas basis; no energy or mass conversion is inferred.'),
 ('gas-imports','26-3-BCM','Dry natural gas imports','gas','Imports','billion m³',1,'Total annual natural gas imports. The record does not identify a trading partner, pipeline or LNG terminal.'),
 ('gas-exports','26-4-BCM','Dry natural gas exports','gas','Exports','billion m³',1,'Total annual natural gas exports. This includes trade on the source’s dry-gas basis, not just LNG, and does not identify destinations.'),
 ('coal-production','7-1-MT','Coal production','coal','Production','tonnes',1000,'Annual coal production by mass, across the coal grades included by EIA. Coal types have different energy contents.'),
 ('coal-consumption','7-2-MT','Coal consumption','coal','Consumption','tonnes',1000,'Annual coal consumption by mass. These quantities do not measure combustion emissions.'),
 ('coal-imports','7-3-MT','Coal imports','coal','Imports','tonnes',1000,'Annual coal imports, across source coal grades. This is a country total, not a bilateral shipment record.'),
 ('coal-exports','7-4-MT','Coal exports','coal','Exports','tonnes',1000,'Annual coal exports, across source coal grades. No destination or transport route is inferred.'),
 ('met-coal-production','130-1-MT','Metallurgical coal production','coal','Metallurgical coal','tonnes',1000,'Coal classified for metallurgical uses. A subset of coal production: never add this to total coal.'),
]
JODI = [
 ('monthly-crude-production','CRUDEOIL','INDPROD','Crude oil production','Production','Monthly crude oil production, expressed as an average daily rate. JODI and EIA product definitions differ; these series are kept separate.'),
 ('monthly-crude-exports','CRUDEOIL','TOTEXPSB','Crude oil exports','Exports','Reported crude oil exports for the selected month, as an average daily rate. Destination countries are not supplied in this table.'),
 ('monthly-crude-imports','CRUDEOIL','TOTIMPSB','Crude oil imports','Imports','Reported crude oil imports for the selected month, as an average daily rate. Origin countries are not supplied in this table.'),
 ('monthly-refinery-intake','CRUDEOIL','REFINOBS','Crude oil refinery intake','Refinery intake','Crude oil entering refineries, as an average daily rate. It excludes other feedstocks and does not measure refinery capacity or product output.'),
 ('monthly-ngl-production','NGL','INDPROD','Natural gas liquids production','Natural gas liquids','Monthly natural gas liquids production. Kept separate from crude oil and from total petroleum products.'),
]
MIDDLE_EAST=['BHR','CYP','IRN','IRQ','ISR','JOR','KWT','LBN','OMN','PSE','QAT','SAU','SYR','TUR','ARE','YEM']
ASSESSMENTS={'1':'Reasonably comparable','2':'Use with caution; consult metadata','3':'Not assessed','4':'Under verification'}
