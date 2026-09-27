import type {FacilityKind} from '@/packages/material-world/model';

export type MaterialSiteLayer={kind:FacilityKind;type:string;label:string;explanation:string};
const layer=(kind:FacilityKind,type:string,label:string,explanation:string):MaterialSiteLayer=>({kind,type,label,explanation});
const plastic=layer('industry','Petrochemical cracking','Petrochemical plants','Cracking breaks hydrocarbons into chemical feedstocks used in plastics and other products. These sites do not identify a particular packaging supplier.');
export const materialSiteLayers:Record<string,MaterialSiteLayer[]>={
 copper:[layer('mining','Copper mine','Copper mines','These source records identify copper mining operations. Their climate estimates are not tonnes of copper: gross ore, concentrate and contained metal are different quantities.')],
 aluminium:[layer('mining','Bauxite mine','Bauxite mines','Bauxite supplies aluminium ore. Refining bauxite into alumina and smelting alumina into metal are separate stages.'),layer('industry','Aluminium','Aluminium plants','These locations identify aluminium operations in the source inventory. A location alone does not establish where a plant obtains its alumina or electricity.')],
 steel:[layer('mining','Iron mine','Iron mines','Iron-bearing ore is mined and processed before ironmaking. Source emissions do not measure the amount of contained iron.'),layer('industry','Iron & steel','Iron & steel plants','Steel can use iron ore, recovered scrap, or both. The inventory locates plants; it does not establish the scrap share of each product.')],
 concrete:[layer('industry','Cement','Cement plants','Cement binds sand and aggregates into concrete. Cement output, concrete output and mineral extraction are different quantities.'),layer('industry','Lime','Lime plants','Heating limestone produces lime and releases carbon dioxide. Lime has several industrial uses; these plants are not all concrete suppliers.')],
 glass:[layer('industry','Glass','Glass plants','Glassmaking melts mineral inputs and may incorporate recovered glass. These records do not specify the recycled content of a bottle.')],
 paper:[layer('industry','Pulp & paper','Pulp & paper mills','Mills process wood fibre, recovered paper or both. Paper production can use imported fibre, so a mill’s country need not be where its trees grew.')],
 wood:[layer('industry','Pulp & paper','Pulp & paper mills','One destination for wood is pulp and paper production. This inventory is not a map of all sawmills or harvested forests.')],
 plastic:[plastic],
 'rigid-plastic':[plastic],
 textiles:[layer('industry','Textiles, leather & apparel','Textile & apparel sites','The source groups textiles, leather and apparel together. These records cannot separate cotton, wool and synthetic fibres or identify a garment’s supplier.')],
 food:[layer('industry','Food, beverage & tobacco','Food-processing sites','The source category combines food, beverages and tobacco. These are processing locations, not fields, livestock counts or a complete map of food supply.')],
 fuels:[layer('energy','Oil / gas production','Oil & gas production','Point-source centroids can represent production areas, including offshore operations. Use national energy data for country output.'),layer('energy','Oil refinery','Refineries','Refining turns crude oil into different fuels and other products. A refinery location does not identify the source of its crude.'),layer('mining','Coal mine','Coal mines','Coal mines and power plants are separate facilities. The source records estimate emissions, not the path of individual coal shipments.')],
 electronics:[layer('mining','Copper mine','Copper inputs','Copper is one of many inputs to electronics. These mines are not a verified supply chain for a device or manufacturer.')],
 garbage:[layer('landfill','','Waste infrastructure','Collection, recovery, treatment and disposal sites play different roles. Source classes and reporting coverage vary by country.')],
};
