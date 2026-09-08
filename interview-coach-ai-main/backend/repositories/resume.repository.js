import { getSupabase } from "../config/supabase.js";

// ─────────────────────────────────────────────────────────────────────────────
// Resume Repository — all database operations for resumes and analysis data
// ─────────────────────────────────────────────────────────────────────────────

export const resumeRepository = {
  async create(userId, fileData) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("resumes")
      .insert({
        user_id: userId,
        file_name: fileData.fileName,
        file_url: fileData.fileUrl || null,
        file_size: fileData.fileSize || null,
        mime_type: fileData.mimeType || null,
        extracted_text: fileData.extractedText || "",
        overall_score: fileData.overallScore || 0,
        ats_score: fileData.atsScore || 0,
        target_role: fileData.targetRole || "Software Engineer",
        version: fileData.version || 1,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("resumes")
      .select("*")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  async findByUser(userId, limit = 20) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("resumes")
      .select(
        "id, file_name, overall_score, ats_score, target_role, version, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async findLatestByUser(userId) {
    const sb = getSupabase();
    const { data } = await sb
      .from("resumes")
      .select(
        "id, overall_score, ats_score, target_role, file_name, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    return data || null;
  },

  async countByUser(userId) {
    const sb = getSupabase();
    const { count } = await sb
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    return count || 0;
  },

  // ── Extracted info ──────────────────────────────────────────────────────────

  async saveExtractedInfo(resumeId, info) {
    const sb = getSupabase();
    const { error } = await sb.from("resume_extracted_info").upsert(
      {
        resume_id: resumeId,
        candidate_name: info.name || null,
        email: info.email || null,
        phone: info.phone || null,
        location: info.location || null,
        linkedin_url: info.linkedIn || null,
        github_url: info.gitHub || null,
        education: info.education || [],
        experience: info.experience || [],
        certifications: info.certifications || [],
        projects: info.projects || [],
        skills: info.skills || [],
        languages: info.languages || [],
        word_count: info.wordCount || 0,
        estimated_pages: info.estimatedPages || 1,
      },
      { onConflict: "resume_id" },
    );
    if (error) throw error;
  },

  // ── Section scores ──────────────────────────────────────────────────────────

  async saveSectionScores(resumeId, scores) {
    const sb = getSupabase();
    const { error } = await sb.from("resume_section_scores").upsert(
      {
        resume_id: resumeId,
        ats_compatibility: scores.atsCompatibility || 0,
        skills: scores.skills || 0,
        keywords: scores.keywords || 0,
        education: scores.education || 0,
        experience: scores.experience || 0,
        projects: scores.projects || 0,
        certifications: scores.certifications || 0,
        formatting: scores.formatting || 0,
        content_quality: scores.contentQuality || 0,
        job_relevance: scores.jobRelevance || 0,
      },
      { onConflict: "resume_id" },
    );
    if (error) throw error;
  },

  // ── Resume health ───────────────────────────────────────────────────────────

  async saveResumeHealth(resumeId, health) {
    const sb = getSupabase();
    const { error } = await sb.from("resume_health").upsert(
      {
        resume_id: resumeId,
        good_points: health.good || [],
        improvements: health.improvements || [],
        missing_items: health.missing || [],
        recommendations: health.recommendations || [],
      },
      { onConflict: "resume_id" },
    );
    if (error) throw error;
  },

  // ── Keywords ────────────────────────────────────────────────────────────────

  async saveKeywords(resumeId, keywordAnalysis) {
    const sb = getSupabase();
    await sb.from("resume_keywords").delete().eq("resume_id", resumeId);
    const rows = [];
    for (const k of keywordAnalysis.keywordsFound || []) {
      rows.push({
        resume_id: resumeId,
        keyword: k.keyword,
        status: "found",
        frequency: k.frequency || 0,
        importance: k.importance,
      });
    }
    for (const k of keywordAnalysis.missingKeywords || []) {
      rows.push({
        resume_id: resumeId,
        keyword: k.keyword,
        status: "missing",
        importance: k.importance,
        suggestion: k.suggestion,
      });
    }
    for (const k of keywordAnalysis.keywordsToImprove || []) {
      rows.push({
        resume_id: resumeId,
        keyword: k.keyword,
        status: "needs_improvement",
        frequency: k.frequency || 0,
        importance: k.importance,
        recommendation: k.recommendation,
      });
    }
    if (rows.length > 0) {
      const { error } = await sb.from("resume_keywords").insert(rows);
      if (error) throw error;
    }
  },

  async getKeywords(resumeId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("resume_keywords")
      .select("*")
      .eq("resume_id", resumeId);
    if (error) throw error;
    const found = (data || [])
      .filter((k) => k.status === "found")
      .map((k) => ({
        keyword: k.keyword,
        frequency: k.frequency,
        importance: k.importance,
      }));
    const missing = (data || [])
      .filter((k) => k.status === "missing")
      .map((k) => ({
        keyword: k.keyword,
        importance: k.importance,
        suggestion: k.suggestion,
      }));
    const improve = (data || [])
      .filter((k) => k.status === "needs_improvement")
      .map((k) => ({
        keyword: k.keyword,
        frequency: k.frequency,
        importance: k.importance,
        recommendation: k.recommendation,
        found: true,
      }));
    return {
      keywordsFound: found,
      missingKeywords: missing,
      keywordsToImprove: improve,
    };
  },

  // ── Improvement suggestions ─────────────────────────────────────────────────

  async saveImprovementSuggestions(resumeId, suggestions) {
    const sb = getSupabase();
    await sb
      .from("resume_improvement_suggestions")
      .delete()
      .eq("resume_id", resumeId);
    if (!suggestions || suggestions.length === 0) return;
    const rows = suggestions.map((s) => ({
      resume_id: resumeId,
      section_name: s.section || "General",
      suggestion_type: s.type || "improvement",
      current_text: s.current || null,
      improved_text: s.improved || null,
      reason: s.reason || null,
    }));
    const { error } = await sb
      .from("resume_improvement_suggestions")
      .insert(rows);
    if (error) throw error;
  },

  async getImprovementSuggestions(resumeId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("resume_improvement_suggestions")
      .select(
        "section_name, suggestion_type, current_text, improved_text, reason",
      )
      .eq("resume_id", resumeId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map((r) => ({
      section: r.section_name,
      type: r.suggestion_type,
      current: r.current_text,
      improved: r.improved_text,
      reason: r.reason,
    }));
  },

  // ── ATS scores ──────────────────────────────────────────────────────────────

  async saveAtsScore(resumeId, atsData) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("ats_scores")
      .insert({
        resume_id: resumeId,
        target_role: atsData.targetRole || "Software Engineer",
        overall_score: atsData.score || 0,
        status_label: atsData.statusLabel || "",
        keyword_match_score: atsData.scoringBreakdown?.keywordMatchScore || 0,
        experience_project_score:
          atsData.scoringBreakdown?.experienceProjectScore || 0,
        section_score: atsData.scoringBreakdown?.sectionScore || 0,
        structure_score: atsData.scoringBreakdown?.structureScore || 0,
        terminology_score: atsData.scoringBreakdown?.terminologyScore || 0,
        contact_score: atsData.scoringBreakdown?.contactScore || 0,
        role_matched_keywords: atsData.roleMatchedKeywords || [],
        missing_keywords: atsData.missingKeywords || [],
        role_improvements: atsData.roleImprovements || [],
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLatestAtsScore(resumeId) {
    const sb = getSupabase();
    const { data } = await sb
      .from("ats_scores")
      .select("*")
      .eq("resume_id", resumeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    return data || null;
  },

  async getAtsHistory(userId, limit = 20) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("resumes")
      .select(
        `
        id, file_name, target_role, ats_score, created_at,
        resume_section_scores(skills)
      `,
      )
      .eq("user_id", userId)
      .gt("ats_score", 0)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  // ── Job description matches ─────────────────────────────────────────────────

  async saveJobMatch(resumeId, matchData) {
    const sb = getSupabase();
    const basePayload = {
        resume_id: resumeId,
        job_description_text: (matchData.jobDescriptionText || "").slice(
          0,
          5000,
        ),
        match_score: matchData.matchScore || 0,
        matching_skills: matchData.matchingSkills || [],
        missing_skills: matchData.missingSkills || [],
        matching_keywords: matchData.matchingKeywords || [],
        missing_keywords: matchData.missingKeywords || [],
        recommendations: matchData.recommendations || [],
        summary: matchData.summary || "",
        required_experience: matchData.requiredExperience || null,
        education_requirements: matchData.educationRequirements || [],
        certification_requirements: matchData.certificationRequirements || [],
    };
    const structuredPayload = {
      ...basePayload,
        requirements: matchData.requirements || [],
        responsibilities: matchData.responsibilities || [],
        categories: matchData.categories || {},
        confidence: matchData.confidence || 0,
        missing_required_skills: matchData.missingRequiredSkills || [],
        missing_preferred_skills: matchData.missingPreferredSkills || [],
    };
    const firstAttempt = await sb
      .from("job_description_matches")
      .insert(structuredPayload)
      .select()
      .single();
    if (!firstAttempt.error) return firstAttempt.data;

    // Older databases may not have migration 002 yet. Preserve the request by
    // retrying with the original schema; the computed structured result is
    // still returned by the service response.
    if (!/schema cache|column .* (not found|does not exist)|could not find/i.test(firstAttempt.error.message || "")) {
      throw firstAttempt.error;
    }
    const legacyAttempt = await sb
      .from("job_description_matches")
      .insert(basePayload)
      .select()
      .single();
    if (legacyAttempt.error) throw legacyAttempt.error;
    return legacyAttempt.data;
  },

  async getLatestJobMatch(resumeId) {
    const sb = getSupabase();
    const { data } = await sb
      .from("job_description_matches")
      .select("*")
      .eq("resume_id", resumeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    return data || null;
  },

  // ── Full analysis (joined read) ──────────────────────────────────────────────

  async getFullAnalysis(resumeId) {
    const sb = getSupabase();
    const [
      resumeRes,
      infoRes,
      scoresRes,
      healthRes,
      kw,
      suggestions,
      atsRes,
      jobMatchRes,
    ] = await Promise.all([
      sb.from("resumes").select("*").eq("id", resumeId).single(),
      sb
        .from("resume_extracted_info")
        .select("*")
        .eq("resume_id", resumeId)
        .single(),
      sb
        .from("resume_section_scores")
        .select("*")
        .eq("resume_id", resumeId)
        .single(),
      sb.from("resume_health").select("*").eq("resume_id", resumeId).single(),
      sb.from("resume_keywords").select("*").eq("resume_id", resumeId),
      sb
        .from("resume_improvement_suggestions")
        .select("*")
        .eq("resume_id", resumeId)
        .order("created_at", { ascending: true }),
      sb
        .from("ats_scores")
        .select("*")
        .eq("resume_id", resumeId)
        .order("created_at", { ascending: false })
        .limit(1),
      sb
        .from("job_description_matches")
        .select("*")
        .eq("resume_id", resumeId)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    return {
      resume: resumeRes.data || null,
      extractedInfo: infoRes.data || null,
      sectionScores: scoresRes.data || null,
      health: healthRes.data || null,
      keywords: kw.data || [],
      suggestions: (suggestions.data || []).map((r) => ({
        section: r.section_name,
        type: r.suggestion_type,
        current: r.current_text,
        improved: r.improved_text,
        reason: r.reason,
      })),
      latestAts: atsRes.data?.[0] || null,
      latestJobMatch: jobMatchRes.data?.[0] || null,
    };
  },
};
