import { useState, useEffect } from "react";

const GA_ID = "G-BK5PFD3319";

const pageNames = {
  welcome:  { path: "/welcome",            title: "Welcome" },
  skintype: { path: "/setup/skin-type",    title: "Setup — Skin Type" },
  concern:  { path: "/setup/skin-concern", title: "Setup — Skin Concern" },
  daily:    { path: "/daily-checkin",      title: "Daily Check-in" },
  routine:  { path: "/routine",            title: "Routine" },
};

const p = {
  bg: "#F8F8F6", white: "#FFFFFF", black: "#1A1A1A", dark: "#2C2C2C",
  mid: "#6B6B6B", light: "#A8A8A8", border: "#E0E0E0", soft: "#F0F0EE",
};

const skinTypes = [
  { id: "dry",         label: "Dry",         desc: "Often feels tight or flaky" },
  { id: "oily",        label: "Oily",         desc: "Tends to shine, especially T-zone" },
  { id: "combination", label: "Combination",  desc: "Oily in some areas, dry in others" },
  { id: "sensitive",   label: "Sensitive",    desc: "Easily reactive or prone to redness" },
];

const concerns = [
  { id: "aging",        label: "Aging & Firmness",     desc: "Fine lines, loss of elasticity" },
  { id: "pigmentation", label: "Pigmentation",          desc: "Dark spots, uneven tone" },
  { id: "acne",         label: "Acne-Prone",            desc: "Frequent breakouts, congestion" },
  { id: "sensitivity",  label: "Sensitivity & Redness", desc: "Reactive, easily irritated" },
  { id: "wellness",     label: "General Wellness",       desc: "No specific concern, maintenance" },
];

const conditions = [
  { id: "calm",       label: "Calm",       desc: "Balanced and comfortable" },
  { id: "dry",        label: "Dry",        desc: "Tight, rough or thirsty" },
  { id: "sensitive",  label: "Sensitive",  desc: "Reactive, tender or flushed" },
  { id: "dull",       label: "Dull",       desc: "Lacking glow or looking tired" },
  { id: "breakout",   label: "Breakout",   desc: "Congested or showing blemishes" },
  { id: "overloaded", label: "Overloaded", desc: "Irritated from too much, too soon" },
];

const treatIntensity = {
  calm: "active", dry: "gentle", sensitive: "gentle",
  dull: "active", breakout: "gentle", overloaded: "gentle",
};

const treatDesc = {
  gentle: "A mild, supportive treatment — think niacinamide, peptides, or a hydrating antioxidant serum.",
  active: "A targeted active treatment — vitamin C, exfoliating acid, or retinol for your skin's long-term needs.",
};

const treatCareTypes = {
  dry: {
    calm:       ["Peptide serum", "Vitamin C serum", "PDRN / Polynucleotide"],
    dry:        ["Peptide serum", "PDRN / Polynucleotide", "Centella serum"],
    sensitive:  ["Centella serum", "Peptide serum"],
    dull:       ["Vitamin C serum", "Exfoliating acid", "Niacinamide"],
    breakout:   ["Niacinamide", "Centella serum", "Salicylic acid serum"],
    overloaded: ["Centella serum", "PDRN / Polynucleotide", "Peptide serum"],
  },
  oily: {
    calm:       ["Vitamin C serum", "Niacinamide", "Retinol"],
    dry:        ["Niacinamide", "Hydrating serum"],
    sensitive:  ["Centella serum", "Niacinamide"],
    dull:       ["Vitamin C serum", "Salicylic acid serum", "Niacinamide"],
    breakout:   ["Salicylic acid serum", "Niacinamide", "Centella serum"],
    overloaded: ["Centella serum", "Niacinamide"],
  },
  combination: {
    calm:       ["Vitamin C serum", "Peptide serum", "Niacinamide"],
    dry:        ["Peptide serum", "Niacinamide", "PDRN / Polynucleotide"],
    sensitive:  ["Centella serum", "Peptide serum"],
    dull:       ["Vitamin C serum", "Exfoliating acid", "Niacinamide"],
    breakout:   ["Salicylic acid serum", "Niacinamide"],
    overloaded: ["Centella serum", "Peptide serum", "PDRN / Polynucleotide"],
  },
  sensitive: {
    calm:       ["Centella serum", "Peptide serum", "PDRN / Polynucleotide"],
    dry:        ["Centella serum", "PDRN / Polynucleotide", "Peptide serum"],
    sensitive:  [],
    dull:       ["Centella serum", "Vitamin C serum (low %)", "Peptide serum"],
    breakout:   ["Centella serum", "Niacinamide"],
    overloaded: ["Centella serum", "PDRN / Polynucleotide"],
  },
};

const layerApplyOrder = {
  RESET:   ["Micellar water", "Oil cleanser", "Cleansing balm", "Foam cleanser", "Gel cleanser"],
  PREP:    ["Hydrating toner", "Essence", "Mist"],
  RESTORE: ["Sheet mask", "Repair ampoule", "Recovery cream", "Sleeping mask"],
  SUPPORT: ["Gel moisturiser", "Moisturiser", "Barrier cream", "Ceramide cream", "Soothing cream", "Face oil"],
  PROTECT: ["Mineral sunscreen", "Chemical sunscreen", "SPF moisturiser", "UV shield spray"],
};

const getTimingLabel = function(item, allSelected) {
  if (item === "Vitamin C serum") return "AM";
  if (item === "Niacinamide" && allSelected.includes("Vitamin C serum")) return "PM";
  return null;
};

const conflicts = [
  { items: ["Vitamin C serum", "Exfoliating acid"],     msg: "Vitamin C and exfoliating acids are best used separately — try alternating days." },
  { items: ["Vitamin C serum", "Salicylic acid serum"], msg: "Vitamin C and salicylic acid can cancel each other out. Use on different days." },
  { items: ["Retinol", "Exfoliating acid"],             msg: "Retinol and acids together can over-sensitise skin. Pick one for tonight." },
  { items: ["Retinol", "Salicylic acid serum"],         msg: "Retinol and salicylic acid are too strong to combine. Use separately." },
  { items: ["Retinol", "Vitamin C serum"],              msg: "Retinol (PM) and vitamin C (AM) work better on a split schedule." },
];

const timingTips = [
  { items: ["Vitamin C serum", "Niacinamide"], msg: "These work well together — for best results, try vitamin C in the AM and niacinamide in the PM." },
];

const strongActives = ["Retinol", "Exfoliating acid", "Salicylic acid serum", "Vitamin C serum"];
const gentleOnlyConditions = ["sensitive", "overloaded", "breakout", "dry"];
const exfoliants = ["Exfoliating acid", "Salicylic acid serum"];

function evaluateTreat(selected, conditionId, recommended) {
  if (selected.length === 0) return null;
  for (var i = 0; i < conflicts.length; i++) {
    var r = conflicts[i];
    if (r.items.every(function(x) { return selected.includes(x); })) return { rating: "can_be_better", msg: r.msg };
  }
  for (var j = 0; j < timingTips.length; j++) {
    var t = timingTips[j];
    if (t.items.every(function(x) { return selected.includes(x); })) return { rating: "good", msg: t.msg };
  }
  if (gentleOnlyConditions.includes(conditionId)) {
    var hasStrong = selected.some(function(s) { return strongActives.includes(s); });
    if (hasStrong && conditionId === "sensitive") return { rating: "can_be_better", msg: "Your skin is reactive today — strong actives may cause irritation. Consider something calmer." };
    if (hasStrong && conditionId === "overloaded") return { rating: "can_be_better", msg: "Your skin is overloaded — give it a break from strong actives today." };
  }
  var allRec = selected.every(function(s) { return recommended.includes(s); });
  if (allRec && selected.length <= 2) return { rating: "perfect", msg: "Great choice — this combination works well for your skin today." };
  if (allRec && selected.length > 2)  return { rating: "good",    msg: "Good selections — just be mindful of layering too many actives at once." };
  return { rating: "good", msg: "This can work — just monitor how your skin responds." };
}

const ratingDisplay = {
  perfect:       { label: "✦ Perfect",      color: p.black,   bg: p.soft    },
  good:          { label: "✓ Good",          color: p.mid,     bg: p.soft    },
  can_be_better: { label: "△ Can be better", color: "#8B6914", bg: "#FDF6E3" },
};

const concernTreatNotes = {
  aging:        { active: "With aging & firmness as your concern, this is a good moment for retinol or a peptide treatment to support renewal and elasticity.", gentle: "Even on gentler days, a peptide serum or PDRN treatment supports firmness without stressing your skin." },
  pigmentation: { active: "A vitamin C serum or gentle exfoliating acid targets uneven tone and brightens over time.", gentle: "A low-concentration niacinamide or antioxidant serum helps manage pigmentation without irritation." },
  acne:         { active: "Niacinamide or a salicylic acid treatment helps manage congestion and reduce future breakouts.", gentle: "A soothing niacinamide serum is enough — your skin is working hard, keep treatment light." },
  sensitivity:  { active: "Keep actives mild today — a centella or antioxidant serum supports without provoking.", gentle: "A calming serum with minimal actives is ideal. Less is more for reactive skin." },
  wellness:     { active: "A gentle vitamin C or brightening serum maintains healthy, even skin over time.", gentle: "A hydrating serum or antioxidant treatment is all you need for maintenance." },
};

const layers = {
  RESET:   { label: "Reset",   desc: "Cleanse and rebalance. Remove what doesn't serve your skin today.",    careTypes: ["Cleansing balm", "Gel cleanser", "Foam cleanser", "Micellar water", "Oil cleanser"], ingredients: { pairs: ["Gentle surfactants pair well with hydrating toners in the next step."], avoid: ["Avoid following a strong cleanser with an exfoliating acid — choose one or the other."], timing: "Suitable for AM and PM. Double cleanse in PM if wearing SPF or makeup." } },
  PREP:    { label: "Prep",    desc: "Hydrate and tone. Prepare your skin to receive care.",                  careTypes: ["Hydrating toner", "Essence", "Mist"], ingredients: { pairs: ["Hyaluronic acid in this step enhances absorption of treatments that follow."], avoid: ["Avoid applying on completely dry skin — a damp face helps layering."], timing: "Use in both AM and PM routines before any treatment steps." } },
  TREAT:   { label: "Treat",   desc: "Targeted actives. A gentle treatment where your skin needs it most.",  careTypes: [], ingredients: { pairs: ["Niacinamide pairs well with most actives and can soothe irritation from retinol.", "PDRN works well alongside hydrating essences for a recovery-focused treat step."], avoid: ["Do not layer vitamin C with AHA/BHA acids in the same routine.", "Retinol and vitamin C are best used on alternate days or AM/PM split."], timing: "Vitamin C: AM. Retinol: PM only. Acids: PM, not daily. PDRN: AM or PM." } },
  RESTORE: { label: "Restore", desc: "Deep renewal. An intensive layer to help your skin recover.",           careTypes: ["Sleeping mask", "Sheet mask", "Repair ampoule", "Recovery cream"], ingredients: { pairs: ["Ceramide-based restoratives work well after any active treatment step."], avoid: ["Avoid using a heavy sleeping mask after strong exfoliation — allow skin to settle first."], timing: "Best used in PM. Sheet masks can be used AM or PM 2-3 times per week." } },
  SUPPORT: { label: "Support", desc: "Moisturise and strengthen. Lock in care and protect your barrier.",    careTypes: ["Moisturiser", "Barrier cream", "Ceramide cream", "Soothing cream", "Face oil", "Gel moisturiser"], ingredients: { pairs: ["Apply face oil after moisturiser to seal in hydration, not before."], avoid: ["Avoid heavy occlusives before SPF in AM — they can dilute sun protection."], timing: "Use in both AM and PM. Lighter textures for AM, richer for PM." } },
  PROTECT: { label: "Protect", desc: "Sunscreen and environmental defence. Your final, essential step.",     careTypes: ["SPF moisturiser", "Mineral sunscreen", "Chemical sunscreen", "UV shield spray"], ingredients: { pairs: ["Apply as the absolute last step before makeup or going outdoors."], avoid: ["Do not mix SPF into your moisturiser — it dilutes the protection factor."], timing: "AM only, or when going outside. Reapply every 2 hours in direct sun exposure." } },
};

const shouldSuppressTreat = function(st, c) { return st === "sensitive" && c === "sensitive"; };

const routineMap = {
  dry: {
    calm:       { layers: ["RESET","PREP","TREAT","SUPPORT","PROTECT"],           name: "Gentle Maintenance", message: "Your skin is balanced today. A nourishing routine with a light treatment is all you need." },
    dry:        { layers: ["RESET","PREP","TREAT","RESTORE","SUPPORT","PROTECT"], name: "Deep Nourish",        message: "Your skin is calling for moisture. Layer hydration gently and keep treatment mild." },
    sensitive:  { layers: ["RESET","PREP","TREAT","SUPPORT","RESTORE"],           name: "Calm & Comfort",      message: "Be gentle today. A mild treatment is fine — just nothing that will provoke." },
    dull:       { layers: ["RESET","PREP","TREAT","SUPPORT","PROTECT"],           name: "Soft Glow",           message: "Let's bring back your radiance — gently. Your treatment step does the work today." },
    breakout:   { layers: ["RESET","TREAT","SUPPORT"],                            name: "Targeted Care",       message: "Address what's happening without stripping. A gentle active and barrier support is enough." },
    overloaded: { layers: ["RESET","PREP","TREAT","RESTORE","SUPPORT"],           name: "Recovery Day",        message: "Keep it simple. A mild treat step, then restore and support — nothing more." },
  },
  oily: {
    calm:       { layers: ["RESET","PREP","TREAT","SUPPORT","PROTECT"],           name: "Balanced Day",        message: "A clean base and a solid treatment step — your routine is working." },
    dry:        { layers: ["RESET","PREP","TREAT","SUPPORT","PROTECT"],           name: "Hydration Focus",     message: "Even oily skin gets thirsty. A hydrating treat step supports without adding weight." },
    sensitive:  { layers: ["RESET","PREP","TREAT","SUPPORT"],                     name: "Minimal & Calm",      message: "Keep actives gentle today. Soothe, treat lightly, and stabilise." },
    dull:       { layers: ["RESET","TREAT","SUPPORT","PROTECT"],                  name: "Refresh & Brighten",  message: "A good cleanse and an active treatment will wake your skin up today." },
    breakout:   { layers: ["RESET","TREAT","SUPPORT"],                            name: "Clarify & Contain",   message: "Cleanse, treat with intention, and support your barrier. Don't over-layer." },
    overloaded: { layers: ["RESET","TREAT","SUPPORT"],                            name: "Minimal Reset",       message: "Strip it back. A gentle treat step, then seal with support." },
  },
  combination: {
    calm:       { layers: ["RESET","PREP","TREAT","SUPPORT","PROTECT"],           name: "Balanced Maintenance",message: "Your skin is in a good place. Let your treatment step do quiet, steady work." },
    dry:        { layers: ["RESET","PREP","TREAT","RESTORE","SUPPORT","PROTECT"], name: "Targeted Nourish",    message: "Hydrate first, treat gently, then restore where your skin needs it most." },
    sensitive:  { layers: ["RESET","PREP","TREAT","SUPPORT","RESTORE"],           name: "Even & Gentle",       message: "Balance without provocation. A mild treat step fits well here." },
    dull:       { layers: ["RESET","TREAT","SUPPORT","PROTECT"],                  name: "Revive & Balance",    message: "A clean base and a targeted active will bring your glow back." },
    breakout:   { layers: ["RESET","TREAT","SUPPORT"],                            name: "Zone Treatment",      message: "Target without disrupting. Treat the zone, support the whole face." },
    overloaded: { layers: ["RESET","PREP","TREAT","RESTORE","SUPPORT"],           name: "Rebalance",           message: "Calm everything down. A gentle treat, then restore and hold the line." },
  },
  sensitive: {
    calm:       { layers: ["RESET","PREP","TREAT","SUPPORT","PROTECT"],           name: "Gentle Maintenance",  message: "A calm day is a gift. A mild treat step fits well — keep everything light." },
    dry:        { layers: ["RESET","PREP","TREAT","RESTORE","SUPPORT"],           name: "Soothe & Nourish",    message: "Gentle layers only. A hydrating treatment, then restore and support." },
    sensitive:  { layers: ["RESET","PREP","SUPPORT"],                             name: "Ultra Minimal",       message: "Today your skin needs rest, not actives. Cleanse gently, hydrate, and protect — nothing more." },
    dull:       { layers: ["RESET","PREP","TREAT","RESTORE","SUPPORT","PROTECT"], name: "Gentle Glow",         message: "A mild treat step can support radiance without stressing your skin." },
    breakout:   { layers: ["RESET","TREAT","SUPPORT"],                            name: "Careful Cleanse",     message: "Cleanse gently and treat with restraint. Your skin is already working hard." },
    overloaded: { layers: ["RESET","PREP","TREAT","RESTORE","SUPPORT"],           name: "Recovery Day",        message: "A very gentle treat step is okay — but keep everything else minimal." },
  },
};

const weeklyCareTips = {
  calm:       { items: ["Exfoliation (1-2x) — slough off dead cells to keep your glow consistent.", "Collagen or hydrating mask (1-2x) — your skin is stable enough to absorb the benefits fully."] },
  dry:        { items: ["Hydrating or sheet mask (2-3x) — your skin is thirsty, give it a deep drink.", "Skip harsh exfoliation this week — a gentle enzyme exfoliant is enough if needed."] },
  sensitive:  { items: ["Soothing mask (1-2x) — centella or cica-based masks help calm reactive skin.", "Hold off on exfoliation until your skin feels more settled."] },
  dull:       { items: ["Exfoliation (1-2x) — essential for dull skin, helps actives absorb better.", "Brightening or vitamin C mask (1-2x) — give your radiance a weekly boost."] },
  breakout:   { items: ["Calming or clarifying mask (1-2x) — clay or centella-based to manage congestion.", "Light exfoliation only (1x) — salicylic acid pad or gentle peel, not both."] },
  overloaded: { items: ["Recovery mask only (1x) — ceramide or barrier-repair mask to restore balance.", "Skip all exfoliation this week — your skin needs to heal, not be pushed."] },
};

const css = `
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes popIn   { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  .fu  { animation:fadeUp 0.45s ease forwards; }
  .fu1 { animation:fadeUp 0.45s ease 0.06s forwards; opacity:0; }
  .fu2 { animation:fadeUp 0.45s ease 0.12s forwards; opacity:0; }
  .fu3 { animation:fadeUp 0.45s ease 0.18s forwards; opacity:0; }
  .fu4 { animation:fadeUp 0.45s ease 0.24s forwards; opacity:0; }
  .fu5 { animation:fadeUp 0.45s ease 0.30s forwards; opacity:0; }
  .fu6 { animation:fadeUp 0.45s ease 0.36s forwards; opacity:0; }
  .slide-up { animation:slideUp 0.4s cubic-bezier(0.32,0.72,0,1) forwards; }
  .fade-in  { animation:fadeIn 0.3s ease forwards; }
  .pop-in   { animation:popIn 0.3s ease forwards; }
  button:active { opacity:0.7; }
`;

function LayerCard({ layerKey, index, concern, conditionId, skinType, onSelect }) {
  const [open, setOpen]         = useState(false);
  const [showIng, setShowIng]   = useState(false);
  const [selected, setSelected] = useState([]);
  const layer      = layers[layerKey];
  const isTreat    = layerKey === "TREAT";
  const isRestore  = layerKey === "RESTORE";
  const intensity  = isTreat ? treatIntensity[conditionId] : null;
  const suppressed = isTreat && shouldSuppressTreat(skinType, conditionId);
  const dc         = "fu" + Math.min(index + 1, 6);

  const displayDesc  = (isTreat && !suppressed) ? treatDesc[intensity] : layer.desc;
  const careTypes    = isTreat ? (treatCareTypes[skinType] && treatCareTypes[skinType][conditionId] ? treatCareTypes[skinType][conditionId] : []) : layer.careTypes;
  const applyOrder   = layerApplyOrder[layerKey];
  const concernNotes = (isTreat && !suppressed && concern.length > 0 && intensity)
    ? concern.map(function(c) { return concernTreatNotes[c] && concernTreatNotes[c][intensity]; }).filter(Boolean)
    : [];
  const evaluation   = (isTreat && selected.length > 0) ? evaluateTreat(selected, conditionId, careTypes) : null;
  const orderedSelected = applyOrder
    ? selected.slice().sort(function(a, b) {
        var ai = applyOrder.indexOf(a);
        var bi = applyOrder.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
    : selected;
  const hasExfoliant = isTreat && selected.some(function(s) { return exfoliants.includes(s); });

  function toggleCare(ct) {
    var next = selected.includes(ct) ? selected.filter(function(c) { return c !== ct; }) : selected.concat([ct]);
    setSelected(next);
    onSelect(layerKey, next);
  }

  return (
    <div className={dc} style={{ borderBottom: "1px solid " + p.border }}>
      <button onClick={function() { setOpen(function(o) { return !o; }); setShowIng(false); }}
        style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"16px 0", textAlign:"left", display:"flex", alignItems:"flex-start", gap:16 }}>
        <span style={{ fontSize:11, color:p.light, fontFamily:"sans-serif", paddingTop:3, minWidth:18 }}>{String(index+1).padStart(2,"0")}</span>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:13, letterSpacing:2, textTransform:"uppercase", color:p.black, fontFamily:"sans-serif" }}>{layer.label}</span>
            {isTreat && !suppressed && (
              <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif", border:"1px solid " + p.border, borderRadius:10, padding:"2px 7px" }}>
                {intensity === "active" ? "Targeted" : "Gentle"}
              </span>
            )}
          </div>
          <p style={{ fontSize:13, color:p.mid, lineHeight:1.6, margin:0 }}>{displayDesc}</p>
        </div>
        <span style={{ fontSize:10, color:p.light, paddingTop:4, fontFamily:"sans-serif" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ paddingLeft:34, paddingBottom:18 }}>
          {careTypes.length > 0 && (
            <div>
              <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif", margin:"0 0 4px" }}>
                {isTreat ? "Suggested for your skin today" : "Care types can be..."}
              </p>
              <p style={{ fontSize:11, color:p.light, fontFamily:"sans-serif", margin:"0 0 10px", lineHeight:1.5 }}>
                {isTreat ? "Tap to mark what you use — these are suggestions only." : "Tap to mark what you use"}
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                {careTypes.map(function(ct) {
                  var sel = selected.includes(ct);
                  return (
                    <button key={ct} onClick={function() { toggleCare(ct); }}
                      style={{ fontSize:12, color:sel?p.white:p.dark, background:sel?p.black:p.soft, border:"1px solid "+(sel?p.black:p.border), borderRadius:20, padding:"5px 12px", fontFamily:"sans-serif", cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5 }}>
                      {sel && <span style={{ fontSize:9 }}>✓</span>}
                      {ct}
                    </button>
                  );
                })}
              </div>

              {orderedSelected.length > 1 && (
                <div className="pop-in" style={{ marginBottom:12 }}>
                  <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif", margin:"0 0 8px" }}>Apply in this order</p>
                  {orderedSelected.map(function(item, i) {
                    return (
                      <div key={item} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <span style={{ fontSize:11, color:p.white, background:p.black, borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif", flexShrink:0 }}>{i+1}</span>
                        <span style={{ fontSize:13, color:p.dark, fontFamily:"sans-serif" }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {isTreat && evaluation && (function() {
                var rd = ratingDisplay[evaluation.rating];
                return (
                  <div className="pop-in" style={{ background:rd.bg, borderRadius:10, padding:"12px 14px", marginBottom:12, border:"1px solid "+(evaluation.rating === "can_be_better" ? "#E8D5A0" : p.border) }}>
                    <p style={{ fontSize:12, fontWeight:"bold", color:rd.color, fontFamily:"sans-serif", margin:"0 0 4px" }}>{rd.label}</p>
                    <p style={{ fontSize:12, color:p.mid, lineHeight:1.6, margin:0, fontFamily:"sans-serif" }}>{evaluation.msg}</p>
                  </div>
                );
              })()}

              {hasExfoliant && (
                <div className="pop-in" style={{ background:"#F5F0FF", border:"1px solid #DDD5F0", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                  <p style={{ fontSize:11, fontFamily:"sans-serif", color:"#6B5B9A", margin:0, lineHeight:1.65 }}>
                    💡 Exfoliation is most effective 1-2 times per week. Daily use can weaken your skin barrier over time.
                  </p>
                </div>
              )}

              {isTreat && (
                <p style={{ fontSize:11, color:p.light, fontFamily:"sans-serif", margin:"0 0 14px", lineHeight:1.6, fontStyle:"italic" }}>
                  For personalised advice, consult a dermatologist.
                </p>
              )}

              {isRestore && selected.length > 0 && (
                <div className="pop-in" style={{ background:"#F5F0FF", border:"1px solid #DDD5F0", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                  <p style={{ fontSize:11, fontFamily:"sans-serif", color:"#6B5B9A", margin:0, lineHeight:1.65 }}>
                    💡 Intensive care like masks and ampoules work best 1-2 times per week. Let your skin absorb fully between sessions.
                  </p>
                </div>
              )}
            </div>
          )}

          {concernNotes.length > 0 && (
            <div style={{ background:p.soft, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
              <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif", margin:"0 0 8px" }}>For your concerns</p>
              {concernNotes.map(function(note, i) {
                return <p key={i} style={{ fontSize:13, color:p.dark, lineHeight:1.65, margin:i < concernNotes.length-1 ? "0 0 8px" : 0, fontStyle:"italic" }}>— {note}</p>;
              })}
            </div>
          )}

          {!showIng ? (
            <button onClick={function() { setShowIng(true); }}
              style={{ background:"none", border:"1px solid "+p.border, borderRadius:8, padding:"7px 14px", fontSize:11, letterSpacing:2, textTransform:"uppercase", color:p.mid, cursor:"pointer", fontFamily:"sans-serif" }}>
              Ingredient guidance
            </button>
          ) : (
            <div>
              <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif", margin:"0 0 8px" }}>Pairs well</p>
              {layer.ingredients.pairs.map(function(t, i) { return <p key={i} style={{ fontSize:13, color:p.dark, lineHeight:1.65, margin:"0 0 6px" }}>— {t}</p>; })}
              <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif", margin:"12px 0 8px" }}>Use with care</p>
              {layer.ingredients.avoid.map(function(t, i) { return <p key={i} style={{ fontSize:13, color:p.dark, lineHeight:1.65, margin:"0 0 6px" }}>— {t}</p>; })}
              <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif", margin:"12px 0 8px" }}>Timing</p>
              <p style={{ fontSize:13, color:p.dark, lineHeight:1.65, margin:0 }}>{layer.ingredients.timing}</p>
              <button onClick={function() { setShowIng(false); }}
                style={{ background:"none", border:"none", fontSize:11, color:p.light, cursor:"pointer", fontFamily:"sans-serif", marginTop:12, padding:0, letterSpacing:1 }}>
                Close ↑
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoutineSummary({ routineLayers, selectedByLayer }) {
  const [open, setOpen] = useState(false);
  var steps = [];
  var n = 0;
  routineLayers.forEach(function(lk) {
    var sel = selectedByLayer[lk] || [];
    var applyOrder = layerApplyOrder[lk];
    var ordered = applyOrder
      ? sel.slice().sort(function(a, b) {
          var ai = applyOrder.indexOf(a);
          var bi = applyOrder.indexOf(b);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        })
      : sel;
    if (ordered.length === 0) {
      n++;
      steps.push({ n: n, label: layers[lk].label, sub: null, timing: null });
    } else {
      ordered.forEach(function(sub) {
        n++;
        var timing = getTimingLabel(sub, sel);
        steps.push({ n: n, label: layers[lk].label, sub: sub, timing: timing });
      });
    }
  });

  return (
    <div style={{ marginTop:24 }}>
      <button onClick={function() { setOpen(function(o) { return !o; }); }}
        style={{ width:"100%", background:p.soft, border:"1px solid "+p.border, borderRadius:12, padding:"14px 18px", fontSize:12, letterSpacing:2, textTransform:"uppercase", color:p.mid, cursor:"pointer", fontFamily:"sans-serif", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>Today's order</span>
        <span style={{ fontSize:10 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="pop-in" style={{ background:p.white, border:"1px solid "+p.border, borderRadius:"0 0 12px 12px", padding:"16px 18px", marginTop:-1 }}>
          {steps.map(function(step) {
            return (
              <div key={step.n} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <span style={{ fontSize:11, color:p.white, background:p.black, borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif", flexShrink:0 }}>{step.n}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif" }}>{step.label}</span>
                  {step.sub && <span style={{ fontSize:13, color:p.dark, fontFamily:"sans-serif" }}> — {step.sub}</span>}
                </div>
                {step.timing && (
                  <span style={{ fontSize:10, color:p.white, background:p.black, borderRadius:10, padding:"2px 8px", fontFamily:"sans-serif", letterSpacing:1, flexShrink:0 }}>{step.timing}</span>
                )}
              </div>
            );
          })}
          <p style={{ fontSize:11, color:p.light, fontFamily:"sans-serif", margin:"12px 0 0", lineHeight:1.6, fontStyle:"italic" }}>
            Tap each layer above to explore and personalise further.
          </p>
        </div>
      )}
    </div>
  );
}

function WeeklyCare({ conditionId }) {
  var tips = weeklyCareTips[conditionId];
  if (!tips) return null;
  return (
    <div style={{ marginTop:16, background:p.soft, borderRadius:14, padding:"18px 20px" }}>
      <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif", margin:"0 0 12px" }}>This week's care</p>
      {tips.items.map(function(item, i) {
        var parts = item.split(" — ");
        var bold = parts[0];
        var rest = parts[1];
        return (
          <div key={i} style={{ display:"flex", gap:10, marginBottom: i < tips.items.length-1 ? 10 : 0 }}>
            <span style={{ fontSize:14, marginTop:1, flexShrink:0 }}>💡</span>
            <p style={{ fontSize:13, color:p.dark, lineHeight:1.7, margin:0, fontFamily:"sans-serif" }}>
              <strong style={{ color:p.black, fontWeight:600 }}>{bold}</strong>
              {rest ? " — " + rest : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function AboutOverlay({ onClose }) {
  return (
    <div className="fade-in" onClick={onClose}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div className="slide-up" onClick={function(e) { e.stopPropagation(); }}
        style={{ background:p.white, borderRadius:"20px 20px 0 0", padding:"36px 28px 48px", width:"100%", maxWidth:440, boxSizing:"border-box" }}>
        <div style={{ width:32, height:3, background:p.border, borderRadius:2, margin:"0 auto 28px" }} />
        <p style={{ fontSize:10, letterSpacing:4, textTransform:"uppercase", color:p.light, fontFamily:"sans-serif", margin:"0 0 10px" }}>About</p>
        <h2 style={{ fontSize:20, fontWeight:"normal", color:p.black, margin:"0 0 16px", lineHeight:1.35 }}>The Skin Diet</h2>
        <p style={{ fontSize:14, color:p.mid, lineHeight:1.8, margin:"0 0 24px" }}>
          The Skin Diet is a simple, adaptive skincare routine system designed to help you build consistent routines based on your skin's changing daily condition.
        </p>
        <div style={{ width:28, height:1, background:p.border, margin:"0 0 24px" }} />
        <p style={{ fontSize:14, color:p.dark, lineHeight:1.85, fontStyle:"italic", margin:"0 0 32px" }}>
          "Think of your skincare routine as a diet — balanced, intentional, and made just for your skin. Not every day calls for the same approach. The Skin Diet adapts with you, recommending only what your skin needs in this moment."
        </p>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
          <a href="https://www.instagram.com/sydneykunni" target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", gap:8, color:p.mid, textDecoration:"none", fontFamily:"sans-serif", fontSize:12, letterSpacing:1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            by sydneykunni
          </a>
        </div>
        <button onClick={onClose}
          style={{ width:"100%", background:"none", border:"1px solid "+p.border, borderRadius:12, padding:"14px", fontSize:12, letterSpacing:2, textTransform:"uppercase", color:p.light, cursor:"pointer", fontFamily:"sans-serif" }}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep]                       = useState("welcome");
  const [skinType, setSkinType]               = useState(null);
  const [concern, setConcern]                 = useState([]);
  const [condition, setCondition]             = useState(null);
  const [routine, setRoutine]                 = useState(null);
  const [showAbout, setShowAbout]             = useState(false);
  const [selectedByLayer, setSelectedByLayer] = useState({});

  useEffect(function() {
    var page = pageNames[step];
    if (page && typeof window.gtag === "function") {
      window.gtag("config", GA_ID, {
        page_path:  page.path,
        page_title: "The Skin Diet — " + page.title,
      });
    }
  }, [step]);

  function toggleConcern(id) {
    setConcern(function(prev) {
      return prev.includes(id) ? prev.filter(function(c) { return c !== id; }) : prev.concat([id]);
    });
  }

  function generate() {
    if (!skinType || !condition) return;
    setRoutine(routineMap[skinType][condition]);
    setSelectedByLayer({});
    setStep("routine");
  }

  function handleLayerSelect(layerKey, items) {
    setSelectedByLayer(function(prev) {
      var next = Object.assign({}, prev);
      next[layerKey] = items;
      return next;
    });
  }

  const s = {
    app:      { minHeight:"100vh", background:p.bg, fontFamily:"Georgia, serif", color:p.black, display:"flex", flexDirection:"column", alignItems:"center", padding:"0 20px 60px" },
    wrap:     { width:"100%", maxWidth:440 },
    header:   { padding:"40px 0 24px", textAlign:"center", position:"relative" },
    eyebrow:  { fontSize:10, letterSpacing:5, textTransform:"uppercase", color:p.light, marginBottom:6, fontFamily:"sans-serif" },
    wordmark: { fontSize:26, fontWeight:"normal", color:p.black, margin:0, letterSpacing:2 },
    rule:     { width:32, height:1, background:p.border, margin:"16px auto 0" },
    infoBtn:  { position:"absolute", right:0, top:44, background:"none", border:"1px solid "+p.border, borderRadius:20, padding:"4px 12px", cursor:"pointer", fontSize:10, color:p.mid, fontFamily:"sans-serif", letterSpacing:2, textTransform:"uppercase" },
    card:     { background:p.white, borderRadius:16, padding:"32px 28px", boxShadow:"0 2px 20px rgba(0,0,0,0.06)" },
    eyebrowC: { fontSize:10, letterSpacing:4, textTransform:"uppercase", color:p.light, marginBottom:12, fontFamily:"sans-serif" },
    h2:       { fontSize:22, fontWeight:"normal", color:p.black, margin:"0 0 10px", lineHeight:1.35 },
    body:     { fontSize:15, color:p.mid, lineHeight:1.75, margin:"0 0 28px" },
    grid2:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 },
    grid1:    { display:"grid", gridTemplateColumns:"1fr", gap:8, marginBottom:24 },
    tile:     function(sel) { return { background:sel?p.black:p.soft, border:"1.5px solid "+(sel?p.black:p.border), borderRadius:12, padding:"14px 12px", cursor:"pointer", textAlign:"left", transition:"all 0.18s" }; },
    tLabel:   function(sel) { return { fontSize:14, color:sel?p.white:p.black, display:"block", marginBottom:3, fontFamily:"Georgia, serif" }; },
    tDesc:    function(sel) { return { fontSize:11, color:sel?"rgba(255,255,255,0.6)":p.light, lineHeight:1.45, fontFamily:"sans-serif" }; },
    btn:      { width:"100%", background:p.black, color:p.white, border:"none", borderRadius:12, padding:"16px", fontSize:13, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", fontFamily:"sans-serif" },
    ghostBtn: { width:"100%", background:"transparent", color:p.light, border:"1px solid "+p.border, borderRadius:12, padding:"14px", fontSize:12, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", fontFamily:"sans-serif", marginTop:10 },
    tag:      { display:"inline-block", border:"1px solid "+p.border, color:p.mid, fontSize:10, letterSpacing:3, textTransform:"uppercase", padding:"5px 12px", borderRadius:20, marginBottom:14, fontFamily:"sans-serif" },
    message:  { fontSize:15, color:p.dark, lineHeight:1.75, fontStyle:"italic", background:p.soft, borderRadius:12, padding:"16px 18px", marginBottom:8 },
    note:     { fontSize:11, color:p.light, lineHeight:1.7, textAlign:"center", marginTop:20, fontFamily:"sans-serif" },
  };

  var showInfoBtn = step === "daily" || step === "routine";

  return (
    <div style={s.app}>
      <style>{css}</style>
      {showAbout && <AboutOverlay onClose={function() { setShowAbout(false); }} />}
      <div style={s.wrap}>
        <div style={s.header}>
          <p style={s.eyebrow}>Skin Wellness</p>
          <h1 style={s.wordmark}>The Skin Diet</h1>
          <div style={s.rule} />
          {showInfoBtn && <button style={s.infoBtn} onClick={function() { setShowAbout(true); }}>About</button>}
        </div>

        {step === "welcome" && (
          <div style={s.card} className="fu">
            <p style={s.eyebrowC}>Welcome</p>
            <h2 style={s.h2}>Your daily routine, simplified.</h2>
            <p style={s.body}>The Skin Diet recommends the right routine layers for how your skin feels today. No products. No overwhelm. Just a calm, adaptive guide.</p>
            <p style={s.body}>We'll start with two quick questions about your skin. After that, it's a single daily check-in.</p>
            <button style={s.btn} onClick={function() { setStep("skintype"); }}>Begin</button>
          </div>
        )}

        {step === "skintype" && (
          <div style={s.card} className="fu">
            <p style={s.eyebrowC}>Setup · 1 of 2</p>
            <h2 style={s.h2}>What's your skin's natural tendency?</h2>
            <p style={s.body}>This stays with you. We won't ask again.</p>
            <div style={s.grid2}>
              {skinTypes.map(function(t) {
                return (
                  <button key={t.id} style={s.tile(skinType===t.id)} onClick={function() { setSkinType(t.id); }}>
                    <span style={s.tLabel(skinType===t.id)}>{t.label}</span>
                    <span style={s.tDesc(skinType===t.id)}>{t.desc}</span>
                  </button>
                );
              })}
            </div>
            <button style={Object.assign({}, s.btn, { opacity: skinType ? 1 : 0.3 })} disabled={!skinType} onClick={function() { setStep("concern"); }}>Continue</button>
          </div>
        )}

        {step === "concern" && (
          <div style={s.card} className="fu">
            <p style={s.eyebrowC}>Setup · 2 of 2</p>
            <h2 style={s.h2}>What is your skin concern?</h2>
            <p style={s.body}>Choose what your skin struggles with most. We'll keep this in mind when building your routine.</p>
            <div style={s.grid1}>
              {concerns.map(function(c) {
                return (
                  <button key={c.id} style={s.tile(concern.includes(c.id))} onClick={function() { toggleConcern(c.id); }}>
                    <span style={s.tLabel(concern.includes(c.id))}>{c.label}</span>
                    <span style={s.tDesc(concern.includes(c.id))}>{c.desc}</span>
                  </button>
                );
              })}
            </div>
            <button style={Object.assign({}, s.btn, { opacity: concern.length > 0 ? 1 : 0.3 })} disabled={concern.length === 0} onClick={function() { setStep("daily"); }}>Continue</button>
            <button style={s.ghostBtn} onClick={function() { setStep("skintype"); }}>← Back</button>
          </div>
        )}

        {step === "daily" && (
          <div style={s.card} className="fu">
            <p style={s.eyebrowC}>Daily check-in</p>
            <h2 style={s.h2}>How does your skin feel today?</h2>
            <p style={s.body}>One honest answer. Your routine will adapt.</p>
            <div style={s.grid2}>
              {conditions.map(function(c) {
                return (
                  <button key={c.id} style={s.tile(condition===c.id)} onClick={function() { setCondition(c.id); }}>
                    <span style={s.tLabel(condition===c.id)}>{c.label}</span>
                    <span style={s.tDesc(condition===c.id)}>{c.desc}</span>
                  </button>
                );
              })}
            </div>
            <button style={Object.assign({}, s.btn, { opacity: condition ? 1 : 0.3 })} disabled={!condition} onClick={generate}>Show my routine</button>
            <button style={s.ghostBtn} onClick={function() { setSkinType(null); setConcern([]); setStep("skintype"); }}>Update skin profile</button>
          </div>
        )}

        {step === "routine" && routine && (
          <div style={s.card} className="fu">
            <span style={s.tag}>{routine.name}</span>
            <h2 style={s.h2}>{routine.layers.length} layers for today</h2>
            <div style={s.message}>"{routine.message}"</div>
            <p style={{ fontSize:10, color:p.light, fontFamily:"sans-serif", margin:"0 0 4px", letterSpacing:2, textTransform:"uppercase" }}>Tap any layer to explore</p>
            <div>
              {routine.layers.map(function(l, i) {
                return <LayerCard key={l} layerKey={l} index={i} concern={concern} conditionId={condition} skinType={skinType} onSelect={handleLayerSelect} />;
              })}
            </div>
            <RoutineSummary routineLayers={routine.layers} selectedByLayer={selectedByLayer} />
            <WeeklyCare conditionId={condition} />
            <p style={s.note}>This is a guide, not a prescription. Listen to your skin — and when in doubt, consult a dermatologist.</p>
            <button style={Object.assign({}, s.btn, { marginTop:24 })} onClick={function() { setCondition(null); setRoutine(null); setSelectedByLayer({}); setStep("daily"); }}>Check in again</button>
            <button style={s.ghostBtn} onClick={function() { setSkinType(null); setConcern([]); setStep("skintype"); }}>Update skin profile</button>
          </div>
        )}
      </div>
    </div>
  );
}
