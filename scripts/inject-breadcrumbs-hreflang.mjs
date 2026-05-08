import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const HOME = "https://rental-handyman.com/";
const AREAS_HUB = "https://rental-handyman.com/areas/";

const serviceNames = {
  "turnover-make-ready.html": "Turnover Make-Ready",
  "routine-maintenance.html": "Routine Maintenance",
  "property-preservation.html": "Property Preservation",
  "tenant-damage-repair.html": "Tenant Damage Repair",
  "drywall-painting.html": "Drywall & Painting",
  "door-hardware-repair.html": "Doors & Hardware",
  "plumbing-fixtures.html": "Plumbing Fixtures",
  "exterior-repairs.html": "Exterior Repairs",
  "punch-list-completion.html": "Punch List Completion",
  "safety-compliance.html": "Safety & Compliance",
};

const areaNames = {
  "vancouver-wa.html": "Vancouver, WA",
  "camas-wa.html": "Camas, WA",
  "washougal-wa.html": "Washougal, WA",
  "battle-ground-wa.html": "Battle Ground, WA",
  "ridgefield-wa.html": "Ridgefield, WA",
  "hazel-dell-wa.html": "Hazel Dell, WA",
  "salmon-creek-wa.html": "Salmon Creek, WA",
};

function breadcrumbScript(items) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
  return `<script type="application/ld+json">\n  ${JSON.stringify(obj)}\n  </script>`;
}

function injectHreflang(html, canonical) {
  if (html.includes('hreflang="en-US"')) return html;
  return html.replace(
    /(<link rel="canonical" href="[^"]+" \/>)(\r?\n)/,
    `$1$2  <link rel="alternate" hreflang="en-US" href="${canonical}" />$2  <link rel="alternate" hreflang="x-default" href="${canonical}" />$2`
  );
}

function injectBreadcrumb(html, scriptBlock) {
  if (html.includes('"@type":"BreadcrumbList"') || html.includes('"@type": "BreadcrumbList"')) return html;
  return html.replace("</head>", `  ${scriptBlock}\n</head>`);
}

function processFile(relPath) {
  const full = path.join(ROOT, relPath);
  let html = fs.readFileSync(full, "utf8");
  const m = html.match(/<link rel="canonical" href="([^"]+)" \/>/);
  if (!m) return null;
  const canonical = m[1];
  const base = path.basename(relPath);
  const dir = path.dirname(relPath).replace(/\\/g, "/");

  let items;
  if (dir === "services") {
    const name = serviceNames[base];
    if (!name) return null;
    items = [
      { name: "Home", item: HOME },
      { name, item: canonical },
    ];
  } else if (relPath.replace(/\\/g, "/") === "areas/index.html") {
    items = [
      { name: "Home", item: HOME },
      { name: "Service Areas", item: AREAS_HUB },
    ];
  } else if (dir === "areas") {
    const name = areaNames[base];
    if (!name) return null;
    items = [
      { name: "Home", item: HOME },
      { name: "Service Areas", item: AREAS_HUB },
      { name, item: canonical },
    ];
  } else if (base === "quote-builder.html") {
    items = [
      { name: "Home", item: HOME },
      { name: "Repair Quote Builder", item: canonical },
    ];
  } else {
    return null;
  }

  html = injectHreflang(html, canonical);
  html = injectBreadcrumb(html, breadcrumbScript(items));
  fs.writeFileSync(full, html);
  return relPath;
}

const targets = [
  ...fs.readdirSync(path.join(ROOT, "services")).filter((f) => f.endsWith(".html")).map((f) => path.join("services", f)),
  ...fs.readdirSync(path.join(ROOT, "areas")).filter((f) => f.endsWith(".html")).map((f) => path.join("areas", f)),
  "quote-builder.html",
];

const done = [];
for (const rel of targets) {
  const r = processFile(rel);
  if (r) done.push(r);
}
console.log("Updated:\n" + done.join("\n"));
