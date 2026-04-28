// Portland/Vancouver WA market rate catalog (2026)
// Prices reflect typical Clark County / Portland metro handyman rates
// "low" and "high" are estimate ranges; final pricing confirmed after scope review

window.REPAIR_CATALOG = [
  // ---- DRYWALL & PAINT ----
  { id: "dw-small-patch", category: "drywall", name: "Small drywall patch", desc: "Fill nail holes, anchor holes, or dings up to 2 inches. Includes sanding and texture match.", low: 75, high: 125, unit: "per area" },
  { id: "dw-med-patch", category: "drywall", name: "Medium drywall patch", desc: "Patch hole 2-6 inches (e.g., doorknob impact). Mesh tape, mud, sand, texture, prime.", low: 150, high: 275, unit: "per patch" },
  { id: "dw-large-patch", category: "drywall", name: "Large drywall patch", desc: "Patch hole 6+ inches with backer + new drywall section. Includes tape, mud, sand, texture, prime.", low: 275, high: 550, unit: "per patch" },
  { id: "dw-corner-bead", category: "drywall", name: "Corner bead repair", desc: "Replace damaged metal or vinyl corner bead, mud, sand, paint-ready finish.", low: 150, high: 300, unit: "per corner" },
  { id: "paint-touchup", category: "drywall", name: "Paint touch-ups (per visit)", desc: "Color-matched touch-up of patched areas, scuffs, and marks. Up to 1 hour of touch-up.", low: 120, high: 220, unit: "per visit" },
  { id: "paint-room", category: "drywall", name: "Paint single room (walls)", desc: "Two coats latex paint on walls, standard 10x12 room. Includes prep, cut-in, two coats. Customer-supplied paint.", low: 350, high: 650, unit: "per room" },
  { id: "paint-room-trim", category: "drywall", name: "Paint room (walls + trim + doors)", desc: "Full repaint of walls, trim, baseboards, and door faces in one room. Customer-supplied paint.", low: 600, high: 1100, unit: "per room" },
  { id: "paint-unit-1br", category: "drywall", name: "Full repaint - 1BR unit", desc: "Walls and ceilings, neutral color. Up to ~700 sqft. Customer-supplied paint.", low: 1400, high: 2400, unit: "per unit" },
  { id: "paint-unit-2br", category: "drywall", name: "Full repaint - 2BR unit", desc: "Walls and ceilings, neutral color. Up to ~1000 sqft. Customer-supplied paint.", low: 1800, high: 3200, unit: "per unit" },
  { id: "paint-unit-3br", category: "drywall", name: "Full repaint - 3BR house", desc: "Walls and ceilings, neutral color. Up to ~1500 sqft. Customer-supplied paint.", low: 2500, high: 4500, unit: "per unit" },

  // ---- DOORS, LOCKS & HARDWARE ----
  { id: "door-rekey", category: "doors", name: "Rekey existing locks", desc: "Rekey one entry door deadbolt and knob to a new key. Customer keeps existing hardware.", low: 75, high: 125, unit: "per door" },
  { id: "door-deadbolt", category: "doors", name: "Install new deadbolt", desc: "Replace or install single-cylinder deadbolt on prepped door. Hardware not included unless noted.", low: 100, high: 175, unit: "per deadbolt" },
  { id: "door-knob", category: "doors", name: "Replace door knob/lever", desc: "Swap out a door knob or lever set. Hardware not included unless noted.", low: 75, high: 140, unit: "per door" },
  { id: "door-smart-lock", category: "doors", name: "Smart lock install", desc: "Install customer-supplied smart lock or keypad deadbolt. Includes setup and basic programming.", low: 150, high: 275, unit: "per lock" },
  { id: "door-adjust", category: "doors", name: "Adjust sticking door", desc: "Plane, shim, or rehang a door that won't latch or close properly.", low: 100, high: 200, unit: "per door" },
  { id: "door-hinge", category: "doors", name: "Replace damaged hinges", desc: "Replace bent, squeaky, or damaged hinges. Customer-supplied hinges.", low: 75, high: 150, unit: "per door" },
  { id: "door-frame-strike", category: "doors", name: "Repair door frame / strike plate", desc: "Repair kicked-in jamb or replace strike plate with reinforced security plate.", low: 175, high: 400, unit: "per door" },
  { id: "door-interior-replace", category: "doors", name: "Replace interior door slab", desc: "Hang a customer-supplied prehung or slab interior door.", low: 200, high: 425, unit: "per door" },
  { id: "door-cabinet-hw", category: "doors", name: "Cabinet hardware replacement", desc: "Replace knobs/pulls on existing cabinets. Customer-supplied hardware. Up to 25 pieces.", low: 150, high: 325, unit: "per kitchen" },

  // ---- PLUMBING FIXTURES ----
  { id: "plumb-faucet-bath", category: "plumbing", name: "Replace bathroom faucet", desc: "Remove and install single or widespread bathroom faucet. Customer-supplied fixture.", low: 175, high: 325, unit: "per faucet" },
  { id: "plumb-faucet-kitchen", category: "plumbing", name: "Replace kitchen faucet", desc: "Remove and install kitchen faucet, including sprayer. Customer-supplied fixture.", low: 200, high: 375, unit: "per faucet" },
  { id: "plumb-toilet", category: "plumbing", name: "Replace toilet", desc: "Remove old toilet, install customer-supplied toilet with new wax ring and supply line.", low: 275, high: 475, unit: "per toilet" },
  { id: "plumb-toilet-internals", category: "plumbing", name: "Toilet flapper/fill valve repair", desc: "Replace flapper, fill valve, or flush handle to fix running or weak-flushing toilet.", low: 100, high: 175, unit: "per toilet" },
  { id: "plumb-supply", category: "plumbing", name: "Replace supply lines", desc: "Replace braided steel supply lines under sink or toilet.", low: 75, high: 150, unit: "per line" },
  { id: "plumb-disposal", category: "plumbing", name: "Garbage disposal install", desc: "Remove old disposal and install customer-supplied unit. Includes wiring connection.", low: 200, high: 350, unit: "per disposal" },
  { id: "plumb-shower-head", category: "plumbing", name: "Replace showerhead / valve trim", desc: "Swap shower head or trim kit. Customer-supplied fixture.", low: 100, high: 200, unit: "per shower" },
  { id: "plumb-caulk-bath", category: "plumbing", name: "Re-caulk bathroom (tub/shower)", desc: "Remove old caulk, clean surfaces, apply mildew-resistant silicone caulk to tub or shower surround.", low: 150, high: 275, unit: "per bathroom" },
  { id: "plumb-caulk-kitchen", category: "plumbing", name: "Re-caulk kitchen counters/sink", desc: "Remove and replace caulk around sink, counter backsplash, and cooktop.", low: 100, high: 200, unit: "per kitchen" },

  // ---- ELECTRICAL / FIXTURES ----
  { id: "elec-light", category: "electrical", name: "Replace light fixture", desc: "Swap interior light fixture with customer-supplied fixture. Existing box and wiring.", low: 125, high: 225, unit: "per fixture" },
  { id: "elec-ceiling-fan", category: "electrical", name: "Install ceiling fan", desc: "Install customer-supplied ceiling fan in existing fan-rated box. No new wiring.", low: 200, high: 375, unit: "per fan" },
  { id: "elec-outlet-cover", category: "electrical", name: "Replace outlet/switch covers", desc: "Replace cracked or yellowed outlet and switch covers. Up to 20 covers.", low: 75, high: 150, unit: "per unit" },
  { id: "elec-gfci", category: "electrical", name: "Install GFCI outlet", desc: "Replace standard outlet with GFCI in kitchen, bath, garage, or exterior. Existing wiring required.", low: 100, high: 175, unit: "per outlet" },
  { id: "elec-dimmer", category: "electrical", name: "Install dimmer switch", desc: "Replace standard switch with customer-supplied dimmer.", low: 90, high: 160, unit: "per switch" },
  { id: "elec-doorbell", category: "electrical", name: "Doorbell / video doorbell install", desc: "Replace existing doorbell with new chime or smart video doorbell. Customer-supplied unit.", low: 125, high: 250, unit: "per doorbell" },
  { id: "elec-bath-fan", category: "electrical", name: "Replace bathroom exhaust fan", desc: "Remove old fan and install customer-supplied replacement using existing duct and wiring.", low: 200, high: 375, unit: "per fan" },

  // ---- SAFETY & COMPLIANCE ----
  { id: "safety-smoke", category: "safety", name: "Smoke detector install", desc: "Install or replace smoke alarm with battery or hardwired model. Customer-supplied unit.", low: 50, high: 90, unit: "each" },
  { id: "safety-co", category: "safety", name: "CO alarm install", desc: "Install or replace carbon monoxide alarm. Customer-supplied unit.", low: 50, high: 90, unit: "each" },
  { id: "safety-combo", category: "safety", name: "Smoke + CO combo install", desc: "Install combination smoke / CO alarm. Customer-supplied unit.", low: 60, high: 110, unit: "each" },
  { id: "safety-extinguisher", category: "safety", name: "Mount fire extinguisher bracket", desc: "Install wall-mount bracket for fire extinguisher (kitchen/garage).", low: 60, high: 110, unit: "each" },
  { id: "safety-handrail", category: "safety", name: "Install or repair handrail", desc: "Repair loose handrail or install new handrail on existing stairs.", low: 175, high: 400, unit: "per run" },
  { id: "safety-grab-bar", category: "safety", name: "Install grab bar", desc: "Mount ADA-style grab bar in shower or near toilet. Studs or wall anchors as needed.", low: 100, high: 200, unit: "per bar" },

  // ---- EXTERIOR ----
  { id: "ext-fence-gate", category: "exterior", name: "Repair fence gate", desc: "Re-hang sagging gate, replace hinges or latch hardware.", low: 175, high: 375, unit: "per gate" },
  { id: "ext-fence-board", category: "exterior", name: "Replace fence boards", desc: "Replace up to 6 damaged fence pickets. Customer-supplied lumber.", low: 150, high: 325, unit: "per visit" },
  { id: "ext-trim-paint", category: "exterior", name: "Touch up exterior trim paint", desc: "Sand, prime, and paint exterior trim or fascia (small area). Customer-supplied paint.", low: 200, high: 425, unit: "per visit" },
  { id: "ext-caulk", category: "exterior", name: "Exterior caulk + seal", desc: "Caulk around windows, doors, or siding penetrations to stop drafts and water intrusion.", low: 175, high: 350, unit: "per visit" },
  { id: "ext-pressure-wash", category: "exterior", name: "Pressure wash siding/walkway", desc: "Pressure wash exterior surfaces (siding, walkway, deck, driveway).", low: 250, high: 550, unit: "per visit" },
  { id: "ext-gutter-clean", category: "exterior", name: "Gutter cleaning", desc: "Clear leaves and debris from gutters and downspouts. Single-story home.", low: 175, high: 325, unit: "per home" },
  { id: "ext-screen", category: "exterior", name: "Window screen repair", desc: "Re-screen damaged window screens or replace frame.", low: 60, high: 130, unit: "per screen" },
  { id: "ext-house-numbers", category: "exterior", name: "Install house numbers / mailbox", desc: "Mount new house numbers or replace mailbox post hardware.", low: 90, high: 175, unit: "per item" },

  // ---- TURNOVER PACKAGES ----
  { id: "turn-walkthrough", category: "turnover", name: "Move-out walkthrough + scope", desc: "On-site walkthrough with photos and itemized punch list emailed back to you within 24 hours.", low: 125, high: 200, unit: "per visit" },
  { id: "turn-mini", category: "turnover", name: "Mini turnover (touch-up package)", desc: "Up to 4 hours: nail-hole patches, paint touch-ups, hardware tightening, caulk inspection, light bulbs.", low: 350, high: 525, unit: "per unit" },
  { id: "turn-standard", category: "turnover", name: "Standard turnover - 1BR/studio", desc: "Patch + paint touch-ups, fixture tightening, caulk refresh, hardware swap, full punch-list completion.", low: 750, high: 1400, unit: "per unit" },
  { id: "turn-large", category: "turnover", name: "Standard turnover - 2BR+", desc: "Same as standard turnover, scaled for 2-3 bedroom unit including additional bath and bedrooms.", low: 1100, high: 2200, unit: "per unit" },
  { id: "turn-deep-clean-coord", category: "turnover", name: "Deep cleaning coordination", desc: "We coordinate vetted Clark County cleaning vendor for post-make-ready deep clean.", low: 250, high: 500, unit: "per unit" },
];

window.CATEGORY_LABELS = {
  drywall: "Drywall & Paint",
  doors: "Doors, Locks & Hardware",
  plumbing: "Plumbing Fixtures",
  electrical: "Electrical & Fixtures",
  safety: "Safety & Compliance",
  exterior: "Exterior Repairs",
  turnover: "Turnover Packages",
};
