import { useState } from "react";

const SYSTEM_PROMPT = `You are a senior sales qualification expert for Hungry, a corporate catering company. Evaluate whether a prospective account qualifies based on Hungry's internal rubric. Be specific and actionable — don't just flag issues, tell the rep exactly what to do next.

## HARD DISQUALIFIERS (auto-reject, no exceptions)
- Fully remote company (no physical office)
- Under 25 headcount
- Budget clearly non-viable for their market (see Market Pricing)

## REVENUE TIERS
- Tier 3 / SMB: MRR < $10K | Min order spend: $500 | Growth accounts
- Tier 2 / Mid-Market: MRR $10K–$25K | Min order spend: $300 | Mid-large accounts
- Tier 1 / Enterprise: MRR $25K+ | Min order spend: $300 | Large/complex accounts | Below-margin requires CEO/President approval
- All tiers: $1,000/month minimum MRR floor | 30% minimum margin across all tiers

## IDEAL CLIENT PROFILE
- Headcount sweet spot: 50–5,000
- Meals/day sweet spot: 25–500
- Work model: In-office or hybrid ONLY
- Best-fit industries: Tech, Fintech, VC/PE, Trading, Aerospace, Biotech, Medical Devices

## MARKET PRICING — Client food price floors by city
Flag budget BELOW these ranges. Budget below floor requires Sales Management approval to proceed.
- San Francisco / Santa Clara / Oakland / Los Angeles: $20–$22
- New York: $21–$23
- Boston: $19–$21
- Austin / Chicago / Dallas / Washington D.C. / Salt Lake City: $18–$20
- Toronto / Vancouver: $23–$25
- Other/Unknown: flag if under $18

Budget-to-quality impact:
- Under $15/person: 75% chefs only — flag hard, very limited vendor quality
- $15–$20/person: 50% chefs — moderate
- $20+/person: 100% restaurants — ideal

NOTE: If client uses retail pricing (employees pay above a stipend), that is NOT a budget floor violation. Only flag if the all-in company budget is below the floor with no employee contribution.

## MARKET STATUS
- Established (SF, Santa Clara, Austin, Toronto): Full support
- Emerging (Oakland, Boston, Chicago, Dallas, LA, Vancouver): Manageable, growing
- Launch (New York, Salt Lake City, Washington D.C.): Flag — limited ops capacity, may need leadership involvement

## MARGIN (Catering)
- 30%+ = green light to activate
- Under 30% = flag; must email Dan, Kyle, and Jeff with margin calculator + client profile for approval
- Enterprise under margin = requires CEO or President approval specifically
- Formula: Margin % = (Total Revenue - Food Cost per meal - Labor Cost per meal) / Total Revenue
- Cannot activate catering without running margin calc first

## GROUP ORDER STANDARDS
- Target: 25+ meals per meal period. Under 25 = requires Sales Management approval
- Delivery fees: 15% for 25+ meals | $65 flat for 10–24 meals | $125 for 1–9 meals
- Min 2 menu concepts/day standard
- Using retail priced meals: no approval needed
- All-in budget below market floor: Sales Management approval required

## STAFFING BY HEADCOUNT
- <50 diners: 1 captain | 50–100: 2 captains | 100–200: 3 captains | 200–300: 4 captains | 300–400: 4–5 captains
- Additional captains or time: $50/hour
- W2 added cost: SMB = $100/hour | Mid-Market and Enterprise = included

## CLEANUP
All tiers include 90 minutes of cleanup. Additional time is $50/hour for all tiers.

## ELEVATED SETUP
Requires: space, plumbing, electrical, ops walkthrough, 2–4 week lead time.
- SMB: NOT included. $300/instance. Requires ops site-qualification.
- Mid-Market: NOT included. Client pays for equipment. Requires ops site-qualification.
- Enterprise: INCLUDED. Contract must include equipment buyout clause if SOW cancelled.

## OPERATIONAL RED FLAGS
- Enterprise-level requests from low MRR accounts
- Aggressive launch timelines (under 2–4 weeks)
- Custom reporting requests
- Non-standard elevated setup requirements
- Combined pantry + catering requests
- Custom invoicing or billing structure

## APPROVAL ROUTING
- Catering margin under 30%: email Dan, Kyle, and Jeff
- Group order outside service level standard: email Dan
- All-in budget below market floor: Sales Management approval
- Elevated setup: spec with local ops manager + CSM first
- <25 meals/period: Sales Management approval

Return your response as a JSON object with this exact structure:
{
  "verdict": "QUALIFIED" | "NEEDS_REVIEW" | "DISQUALIFIED",
  "tier": "SMB" | "MID_MARKET" | "ENTERPRISE" | "UNKNOWN",
  "summary": "2-3 sentence plain English summary of the decision",
  "factors": [
    {
      "label": "Factor name",
      "status": "pass" | "flag" | "fail",
      "note": "Brief explanation"
    }
  ],
  "recommended_actions": ["Action 1", "Action 2"]
}

Only return valid JSON, no markdown, no preamble.`;

const fields = [
  { id: "company", label: "Company Name", type: "text", placeholder: "Acme Corp" },
  { id: "industry", label: "Industry", type: "text", placeholder: "e.g. Fintech, Biotech, VC..." },
  { id: "headcount", label: "Headcount", type: "number", placeholder: "e.g. 200" },
  { id: "workModel", label: "Work Model", type: "select", options: ["In-office", "Hybrid", "Unknown"] },
  { id: "mealsPerDay", label: "Est. Meals / Day", type: "number", placeholder: "e.g. 75" },
  { id: "budgetPerPerson", label: "Budget / Person ($)", type: "number", placeholder: "e.g. 22" },
  { id: "frequency", label: "Frequency", type: "select", options: ["Daily", "3-4x/week", "1-2x/week", "Monthly", "Ad hoc", "Unknown"] },
  { id: "projectedMRR", label: "Projected MRR ($)", type: "number", placeholder: "e.g. 15000" },
  { id: "elevatedSetup", label: "Elevated Setup Needed?", type: "select", options: ["No", "Yes", "Unknown"] },
  { id: "marketCity", label: "Market / City", type: "select", options: ["San Francisco", "Santa Clara", "Oakland", "Los Angeles", "Austin", "Boston", "Chicago", "Dallas", "New York", "Salt Lake City", "Toronto", "Vancouver", "Washington D.C.", "Other / Unknown"] },
  { id: "additionalNotes", label: "Additional Notes", type: "textarea", placeholder: "Any other context, special requests, objections..." },
];

const verdictConfig = {
  QUALIFIED: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "QUALIFIED", icon: "✓", pill: "#dcfce7" },
  NEEDS_REVIEW: { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "NEEDS REVIEW", icon: "⚠", pill: "#fef3c7" },
  DISQUALIFIED: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "DISQUALIFIED", icon: "✕", pill: "#fee2e2" },
};

const statusConfig = {
  pass: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "✓" },
  flag: { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "⚠" },
  fail: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "✕" },
};

const tierLabels = { SMB: "SMB — Tier 3", MID_MARKET: "Mid-Market — Tier 2", ENTERPRISE: "Enterprise — Tier 1", UNKNOWN: "Unknown Tier" };
const tierColors = { SMB: "#7c3aed", MID_MARKET: "#0369a1", ENTERPRISE: "#c2410c", UNKNOWN: "#6b7280" };

export default function App() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (id, value) => setForm(prev => ({ ...prev, [id]: value }));

  const buildUserMessage = () => {
    const lines = fields.filter(f => form[f.id]).map(f => `${f.label}: ${form[f.id]}`);
    return `Please qualify this account:\n\n${lines.join("\n")}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserMessage() }],
        }),
      });
      const data = await response.json();
      if (data.error) { setError(`API error: ${data.error.message}`); setLoading(false); return; }
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      if (!raw) { setError("No response received. Try again."); setLoading(false); return; }
      try {
        setResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
      } catch (e) {
        setError(`Parsing failed. Raw: ${raw.slice(0, 300)}`);
      }
    } catch (e) {
      setError(`Request failed: ${e.message}`);
    }
    setLoading(false);
  };

  const vc = result ? verdictConfig[result.verdict] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Poppins', 'Inter', sans-serif", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea {
          width: 100%; padding: 10px 14px; border-radius: 8px;
          border: 1.5px solid #e5e7eb; background: #fff;
          font-family: 'Poppins', sans-serif; font-size: 14px; color: #111827;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #f43f8e; box-shadow: 0 0 0 3px rgba(244,63,142,0.1);
        }
        input::placeholder, textarea::placeholder { color: #9ca3af; }
        select option { background: #fff; }
        textarea { resize: vertical; min-height: 80px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #ff1f6e 0%, #ff6b2c 100%)", padding: "0 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 12px" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>HUNGRY</span>
            </div>
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.3)" }} />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 500 }}>Account Qualification Engine</span>
          </div>
          {form.company && !result && (
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{form.company}</span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px" }}>

        {!result ? (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Qualify an Account</h1>
              <p style={{ fontSize: 14, color: "#6b7280" }}>Fill in what you know. Leave unknowns blank and the engine will flag what's missing.</p>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {fields.map(f => (
                  <div key={f.id} style={{ gridColumn: f.id === "company" || f.id === "marketCity" || f.id === "additionalNotes" ? "1 / -1" : "auto" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {f.label}
                    </label>
                    {f.type === "select" ? (
                      <select value={form[f.id] || ""} onChange={e => handleChange(f.id, e.target.value)}>
                        <option value="">Select...</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea placeholder={f.placeholder} value={form[f.id] || ""} onChange={e => handleChange(f.id, e.target.value)} />
                    ) : (
                      <input type={f.type} placeholder={f.placeholder} value={form[f.id] || ""} onChange={e => handleChange(f.id, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ marginTop: 20, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  marginTop: 24, width: "100%", padding: "14px",
                  background: loading ? "#e5e7eb" : "linear-gradient(135deg, #ff1f6e 0%, #ff6b2c 100%)",
                  border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15,
                  color: loading ? "#9ca3af" : "#fff", transition: "opacity 0.2s",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(255,31,110,0.35)",
                }}
              >
                {loading ? "Qualifying..." : "Run Qualification →"}
              </button>
            </div>
          </div>

        ) : (
          <div style={{ animation: "fadeUp 0.3s ease" }}>

            {/* Verdict card */}
            <div style={{ background: vc.bg, border: `1.5px solid ${vc.border}`, borderRadius: 16, padding: "28px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: vc.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: vc.color, fontWeight: 700, flexShrink: 0 }}>
                    {vc.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: vc.color, lineHeight: 1.1 }}>{vc.label}</div>
                    {result.tier && result.tier !== "UNKNOWN" && (
                      <div style={{ marginTop: 6, display: "inline-block", padding: "3px 12px", borderRadius: 20, background: `${tierColors[result.tier]}15`, border: `1px solid ${tierColors[result.tier]}30`, color: tierColors[result.tier], fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {tierLabels[result.tier]}
                      </div>
                    )}
                  </div>
                </div>
                {form.company && <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{form.company}</div>}
              </div>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{result.summary}</p>
            </div>

            {/* Factors */}
            {result.factors?.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Factor Breakdown</span>
                </div>
                {result.factors.map((f, i) => {
                  const sc = statusConfig[f.status];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 20px", borderBottom: i < result.factors.length - 1 ? "1px solid #f9fafb" : "none" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: sc.bg, border: `1px solid ${sc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: sc.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                        {sc.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{f.label}</div>
                        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{f.note}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            {result.recommended_actions?.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recommended Next Steps</span>
                </div>
                {result.recommended_actions.map((action, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 20px", borderBottom: i < result.recommended_actions.length - 1 ? "1px solid #f9fafb" : "none" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg, #ff1f6e, #ff6b2c)", flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{action}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => { setResult(null); setError(null); setForm({}); }}
              style={{ width: "100%", padding: "13px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 14, color: "#374151", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#ff1f6e"; e.target.style.color = "#ff1f6e"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.color = "#374151"; }}
            >
              ← Qualify Another Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
