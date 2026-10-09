// Fixes: Profile Save always failed with a DB "not-null constraint" error
// whenever skills were present. The frontend sends skills as plain strings
// (["Java","Python"]), but replaceUserSkills() expected objects ({name:...}),
// so skill_name was always undefined -> null -> DB rejected the insert.
// Run from interview-coach-ai-main root: node fix-skills-save.mjs
import { readFileSync, writeFileSync } from "fs";
function patch(path, oldStr, newStr, label, skipIfPresent = null) {
  const content = readFileSync(path, "utf-8");
  if (skipIfPresent && content.includes(skipIfPresent)) { console.log(`SKIP  ${label}: already applied.`); return; }
  const count = content.split(oldStr).length - 1;
  if (count === 0) { console.log(`SKIP  ${label}: anchor not found.`); return; }
  if (count > 1) { console.log(`ABORT ${label}: anchor found ${count} times.`); process.exit(1); }
  writeFileSync(path, content.replace(oldStr, newStr), "utf-8");
  console.log(`OK    ${label}: patched.`);
}

const f = "backend/repositories/user.repository.js";
patch(f,
`  async replaceUserSkills(userId, skills) {
    const sb = getSupabase();
    await sb.from('user_skills').delete().eq('user_id', userId);
    if (!skills || skills.length === 0) return [];
    const rows = skills.map(s => ({
      user_id:    userId,
      skill_name: s.name,
      level:      s.level || 0,
      category:   s.category || 'General',
    }));
    const { data, error } = await sb.from('user_skills').insert(rows).select();
    if (error) throw error;
    return data;
  },`,
`  async replaceUserSkills(userId, skills) {
    const sb = getSupabase();
    await sb.from('user_skills').delete().eq('user_id', userId);
    if (!skills || skills.length === 0) return [];
    // Skills can arrive as plain strings (["Java","Python"]) or as
    // objects ({name, level, category}) -- normalize both, and drop
    // any blank/empty entries so we never insert a null skill_name.
    const rows = skills
      .map(s => (typeof s === 'string' ? { name: s } : (s || {})))
      .filter(s => s.name && String(s.name).trim().length > 0)
      .map(s => ({
        user_id:    userId,
        skill_name: String(s.name).trim(),
        level:      s.level || 0,
        category:   s.category || 'General',
      }));
    if (rows.length === 0) return [];
    const { data, error } = await sb.from('user_skills').insert(rows).select();
    if (error) throw error;
    return data;
  },`,
  "skills: accept plain-string skills, drop blanks",
  "Skills can arrive as plain strings"
);

console.log("\nDone. Backend terminal will auto-restart and pick this up.");
