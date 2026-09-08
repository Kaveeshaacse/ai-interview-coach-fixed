/**
 * MongoDB → Supabase PostgreSQL Migration Script
 *
 * Usage:
 *   1. Set MONGODB_URI in backend/.env
 *   2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env
 *   3. Run: node scripts/migrate-mongodb-to-supabase.js
 *
 * Safe to re-run — uses upsert with conflict handling.
 * Does NOT delete MongoDB data.
 */

import dotenv    from 'dotenv';
import mongoose  from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ── Validate env ──────────────────────────────────────────────────────────────
const { MONGODB_URI, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!MONGODB_URI)                { console.error('❌ MONGODB_URI not set in .env');               process.exit(1); }
if (!SUPABASE_URL)               { console.error('❌ SUPABASE_URL not set in .env');              process.exit(1); }
if (!SUPABASE_SERVICE_ROLE_KEY)  { console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set in .env'); process.exit(1); }

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Counters ──────────────────────────────────────────────────────────────────
const stats = { users: 0, resumes: 0, interviews: 0, aptitude: 0, coding: 0, communication: 0, learningPaths: 0, skills: 0, errors: [] };

// ── ID mapping: MongoDB ObjectId string → new UUID ────────────────────────────
const idMap = new Map();

function getUUID(mongoId) {
  const key = String(mongoId);
  if (!idMap.has(key)) idMap.set(key, randomUUID());
  return idMap.get(key);
}

// ── Mongoose models (minimal schemas for reading) ─────────────────────────────
const UserSchema = new mongoose.Schema({}, { strict: false });
const ResumeSchema = new mongoose.Schema({}, { strict: false });
const InterviewSchema = new mongoose.Schema({}, { strict: false });
const AptitudeSchema = new mongoose.Schema({}, { strict: false });
const CodingSchema = new mongoose.Schema({}, { strict: false });
const CommSchema = new mongoose.Schema({}, { strict: false });
const LearningPathSchema = new mongoose.Schema({}, { strict: false });
const SkillSchema = new mongoose.Schema({}, { strict: false });

const MongoUser         = mongoose.model('User',                UserSchema);
const MongoResume       = mongoose.model('Resume',              ResumeSchema);
const MongoInterview    = mongoose.model('Interview',           InterviewSchema);
const MongoAptitude     = mongoose.model('AptitudeAttempt',     AptitudeSchema);
const MongoCoding       = mongoose.model('CodingAttempt',       CodingSchema);
const MongoComm         = mongoose.model('CommunicationAttempt',CommSchema);
const MongoPath         = mongoose.model('LearningPath',        LearningPathSchema);
const MongoSkill        = mongoose.model('SkillAssessment',     SkillSchema);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Migrate Users
// ─────────────────────────────────────────────────────────────────────────────
async function migrateUsers() {
  console.log('\n📦 Migrating users...');
  const users = await MongoUser.find().lean();

  for (const u of users) {
    const uuid = getUUID(u._id);
    try {
      const { error } = await sb.from('users').upsert({
        id:              uuid,
        email:           u.email,
        password_hash:   u.password || '$2a$10$placeholder_hash_for_migration',
        name:            u.name || 'Migrated User',
        college:         u.college         || '',
        degree:          u.degree          || '',
        branch:          u.branch          || '',
        graduation_year: u.graduationYear  || '',
        phone:           u.phone           || '',
        location:        u.location        || '',
        bio:             u.bio             || '',
        linkedin_url:    u.linkedIn        || '',
        github_url:      u.github          || '',
        portfolio_url:   u.portfolio       || '',
        resume_url:      u.resumeUrl       || '',
        job_preference:  u.jobPreference   || 'Software Engineer',
        total_sessions:  u.totalSessions   || 0,
        last_login_at:   u.lastLoginAt     || u.updatedAt || null,
        created_at:      u.createdAt       || new Date().toISOString(),
        updated_at:      u.updatedAt       || new Date().toISOString(),
      }, { onConflict: 'email' });
      if (error) { stats.errors.push(`User ${u.email}: ${error.message}`); continue; }

      // Skills
      if (u.currentSkills?.length) {
        await sb.from('user_skills').delete().eq('user_id', uuid);
        const rows = u.currentSkills.map(s => ({ user_id: uuid, skill_name: s.name, level: s.level || 0, category: s.category || 'General' }));
        await sb.from('user_skills').insert(rows);
      }

      // Score averages
      if (u.averageScores) {
        await sb.from('user_score_averages').upsert({
          user_id:             uuid,
          resume_score:        u.averageScores.resume        || 0,
          ats_score:           u.averageScores.ats           || 0,
          interview_score:     u.averageScores.interview     || 0,
          communication_score: u.averageScores.communication || 0,
          coding_score:        u.averageScores.coding        || 0,
          aptitude_score:      u.averageScores.aptitude      || 0,
          overall_score:       u.averageScores.overall       || 0,
        }, { onConflict: 'user_id' });
      }

      stats.users++;
    } catch (err) {
      stats.errors.push(`User ${u.email}: ${err.message}`);
    }
  }
  console.log(`   ✅ ${stats.users} users migrated`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Migrate Resumes
// ─────────────────────────────────────────────────────────────────────────────
async function migrateResumes() {
  console.log('\n📦 Migrating resumes...');
  const resumes = await MongoResume.find().lean();

  for (const r of resumes) {
    const uuid   = getUUID(r._id);
    const userId = getUUID(r.userId);

    try {
      const { error } = await sb.from('resumes').upsert({
        id:             uuid,
        user_id:        userId,
        file_name:      r.fileName      || 'resume.pdf',
        file_url:       r.fileUrl       || null,
        file_size:      r.fileSize      || null,
        mime_type:      r.mimeType      || null,
        extracted_text: r.extractedText || '',
        overall_score:  r.resumeScore   || 0,
        ats_score:      r.atsScore      || 0,
        target_role:    r.targetRole    || 'Software Engineer',
        version:        r.version       || 1,
        created_at:     r.createdAt     || new Date().toISOString(),
        updated_at:     r.updatedAt     || new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) { stats.errors.push(`Resume ${r._id}: ${error.message}`); continue; }

      // Extracted info
      if (r.extractedInfo) {
        const ei = r.extractedInfo;
        await sb.from('resume_extracted_info').upsert({
          resume_id:       uuid,
          candidate_name:  ei.name           || null,
          email:           ei.email          || null,
          phone:           ei.phone          || null,
          location:        ei.location       || null,
          linkedin_url:    ei.linkedIn       || null,
          github_url:      ei.gitHub         || null,
          education:       ei.education      || [],
          experience:      ei.experience     || [],
          certifications:  ei.certifications || [],
          projects:        ei.projects       || [],
          skills:          ei.skills         || [],
          languages:       ei.languages      || [],
          word_count:      ei.wordCount      || 0,
          estimated_pages: ei.estimatedPages || 1,
        }, { onConflict: 'resume_id' });
      }

      // Section scores
      if (r.sectionBreakdown) {
        const sb2 = r.sectionBreakdown;
        await sb.from('resume_section_scores').upsert({
          resume_id:        uuid,
          ats_compatibility: sb2.atsCompatibility || 0,
          skills:           sb2.skills           || 0,
          keywords:         sb2.keywords         || 0,
          education:        sb2.education        || 0,
          experience:       sb2.experience       || 0,
          projects:         sb2.projects         || 0,
          certifications:   sb2.certifications   || 0,
          formatting:       sb2.formatting       || 0,
          content_quality:  sb2.contentQuality   || 0,
          job_relevance:    sb2.jobRelevance      || 0,
        }, { onConflict: 'resume_id' });
      }

      // Health
      if (r.resumeAnalysis) {
        const ra = r.resumeAnalysis;
        await sb.from('resume_health').upsert({
          resume_id:       uuid,
          good_points:     ra.good            || [],
          improvements:    ra.improvements    || [],
          missing_items:   ra.missing         || [],
          recommendations: ra.recommendations || [],
        }, { onConflict: 'resume_id' });
      }

      // Keywords
      if (r.keywordAnalysis) {
        const ka = r.keywordAnalysis;
        await sb.from('resume_keywords').delete().eq('resume_id', uuid);
        const rows = [];
        (ka.keywordsFound    || []).forEach(k => rows.push({ resume_id: uuid, keyword: k.keyword, status: 'found',               frequency: k.frequency || 0, importance: k.importance }));
        (ka.missingKeywords  || []).forEach(k => rows.push({ resume_id: uuid, keyword: k.keyword, status: 'missing',             importance: k.importance, suggestion: k.suggestion }));
        (ka.keywordsToImprove|| []).forEach(k => rows.push({ resume_id: uuid, keyword: k.keyword, status: 'needs_improvement',   frequency: k.frequency || 0, importance: k.importance, recommendation: k.recommendation }));
        if (rows.length) await sb.from('resume_keywords').insert(rows);
      }

      // Improvement suggestions — ensure they are OBJECTS not strings
      if (r.improvementSuggestions?.length) {
        await sb.from('resume_improvement_suggestions').delete().eq('resume_id', uuid);
        const rows = r.improvementSuggestions.map(s => {
          // Handle both object and string formats from old MongoDB docs
          if (typeof s === 'string') {
            return { resume_id: uuid, section_name: 'General', suggestion_type: 'improvement', current_text: null, improved_text: s, reason: null };
          }
          return { resume_id: uuid, section_name: s.section || 'General', suggestion_type: s.type || 'improvement', current_text: s.current || null, improved_text: s.improved || null, reason: s.reason || null };
        });
        if (rows.length) await sb.from('resume_improvement_suggestions').insert(rows);
      }

      // ATS score
      if (r.atsDetails || r.rawScoringBreakdown) {
        const ad  = r.atsDetails         || {};
        const rsd = r.rawScoringBreakdown || {};
        await sb.from('ats_scores').insert({
          resume_id:                uuid,
          target_role:              r.targetRole                      || 'Software Engineer',
          overall_score:            r.atsScore                        || 0,
          status_label:             ad.statusLabel                    || '',
          keyword_match_score:      rsd.keywordMatchScore             || ad.scoringBreakdown?.keywordMatchScore      || 0,
          experience_project_score: rsd.experienceProjectScore        || ad.scoringBreakdown?.experienceProjectScore || 0,
          section_score:            rsd.sectionScore                  || ad.scoringBreakdown?.sectionScore           || 0,
          structure_score:          rsd.structureScore                || ad.scoringBreakdown?.structureScore         || 0,
          terminology_score:        rsd.terminologyScore              || ad.scoringBreakdown?.terminologyScore       || 0,
          contact_score:            rsd.contactScore                  || ad.scoringBreakdown?.contactScore           || 0,
          role_matched_keywords:    ad.roleMatchedKeywords            || [],
          missing_keywords:         ad.missingKeywords                || [],
          role_improvements:        ad.roleImprovements               || [],
          created_at:               r.createdAt                       || new Date().toISOString(),
        });
      }

      // Job match
      if (r.jobMatch?.matchScore) {
        const jm = r.jobMatch;
        await sb.from('job_description_matches').insert({
          resume_id:                  uuid,
          job_description_text:       (jm.jobDescriptionText || '').slice(0, 5000),
          match_score:                jm.matchScore              || 0,
          matching_skills:            jm.matchingSkills          || [],
          missing_skills:             jm.missingSkills           || [],
          matching_keywords:          jm.matchingKeywords        || [],
          missing_keywords:           jm.missingKeywords         || [],
          recommendations:            jm.recommendations         || [],
          summary:                    jm.summary                 || '',
          required_experience:        jm.requiredExperience      || null,
          education_requirements:     jm.educationRequirements   || [],
          certification_requirements: jm.certificationRequirements || [],
          created_at:                 r.createdAt                || new Date().toISOString(),
        });
      }

      stats.resumes++;
    } catch (err) {
      stats.errors.push(`Resume ${r._id}: ${err.message}`);
    }
  }
  console.log(`   ✅ ${stats.resumes} resumes migrated`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Migrate Interviews
// ─────────────────────────────────────────────────────────────────────────────
async function migrateInterviews() {
  console.log('\n📦 Migrating interviews...');
  const records = await MongoInterview.find().lean();

  for (const r of records) {
    const uuid   = getUUID(r._id);
    const userId = getUUID(r.userId);

    try {
      const { error } = await sb.from('interviews').upsert({
        id:               uuid,
        user_id:          userId,
        role:             r.role             || 'Software Engineer',
        type:             r.type             || 'Behavioral',
        technology:       r.technology       || '',
        difficulty:       r.difficulty       || 'Medium',
        total_score:      r.totalScore       || 0,
        overall_feedback: r.overallFeedback  || r.feedback || '',
        strengths:        r.strengths        || [],
        weaknesses:       r.weaknesses       || [],
        recommended_topics: r.recommendedTopics || [],
        status:           r.status           || 'completed',
        duration_minutes: r.durationMinutes  || 15,
        completed_at:     r.completedAt      || r.updatedAt || null,
        created_at:       r.createdAt        || new Date().toISOString(),
        updated_at:       r.updatedAt        || new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) { stats.errors.push(`Interview ${r._id}: ${error.message}`); continue; }

      // Questions
      if (r.questions?.length) {
        const qRows = r.questions.map((q, idx) => ({
          interview_id:   uuid,
          question_order: idx,
          question_text:  q.question || '',
          topic:          q.topic    || '',
          category:       q.category || '',
          difficulty:     q.difficulty || 'Medium',
          technology:     q.technology || '',
        }));
        await sb.from('interview_questions').insert(qRows);
      }

      // Answers
      if (r.answers?.length) {
        const aRows = r.answers.map((a, idx) => ({
          interview_id:    uuid,
          question_order:  typeof a.questionId === 'number' ? a.questionId - 1 : idx,
          question_text:   a.question        || '',
          user_answer:     a.userAnswer      || '',
          score:           a.score           || 0,
          clarity_score:   a.clarityScore    || 0,
          grammar_score:   a.grammarScore    || 0,
          confidence_score:a.confidenceScore || 0,
          technical_score: a.technicalScore  || 0,
          feedback:        a.feedback        || '',
          strengths:       a.strengths       || [],
          weaknesses:      a.weaknesses      || [],
          improved_answer: a.improvedAnswer  || '',
          evaluated_at:    a.evaluatedAt     || r.updatedAt || new Date().toISOString(),
        }));
        await sb.from('interview_answers').insert(aRows);
      }

      stats.interviews++;
    } catch (err) {
      stats.errors.push(`Interview ${r._id}: ${err.message}`);
    }
  }
  console.log(`   ✅ ${stats.interviews} interviews migrated`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Migrate Aptitude Attempts
// ─────────────────────────────────────────────────────────────────────────────
async function migrateAptitude() {
  console.log('\n📦 Migrating aptitude attempts...');
  const records = await MongoAptitude.find().lean();

  for (const r of records) {
    const uuid   = getUUID(r._id);
    const userId = getUUID(r.userId);

    try {
      const catScores = r.categoryScores instanceof Map
        ? Object.fromEntries(r.categoryScores)
        : (r.categoryScores || {});

      const { error } = await sb.from('aptitude_attempts').upsert({
        id:              uuid,
        user_id:         userId,
        category:        r.category        || 'quantitative',
        total_questions: r.totalQuestions  || 10,
        correct_answers: r.correctAnswers  || 0,
        wrong_answers:   r.wrongAnswers    || 0,
        unanswered:      r.unanswered      || 0,
        score:           r.score           || 0,
        accuracy:        r.accuracy        || 0,
        time_taken:      r.timeTaken       || '',
        weak_areas:      r.weakAreas       || [],
        category_scores: catScores,
        submitted_at:    r.submittedAt     || r.createdAt || new Date().toISOString(),
        created_at:      r.createdAt       || new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) { stats.errors.push(`Aptitude ${r._id}: ${error.message}`); continue; }

      // Answers
      if (r.userAnswers?.length) {
        const rows = r.userAnswers.map(a => ({
          attempt_id:      uuid,
          question_id:     a.questionId     || null,
          question_text:   a.question       || '',
          category:        a.category       || '',
          options:         a.options        || [],
          selected_answer: a.selectedAnswer || null,
          correct_answer:  a.correctAnswer  || '',
          is_correct:      a.isCorrect      || false,
          status:          a.status         || 'unanswered',
          explanation:     a.explanation    || '',
        }));
        await sb.from('aptitude_answers').insert(rows);
      }

      stats.aptitude++;
    } catch (err) {
      stats.errors.push(`Aptitude ${r._id}: ${err.message}`);
    }
  }
  console.log(`   ✅ ${stats.aptitude} aptitude attempts migrated`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — Migrate Coding Attempts
// ─────────────────────────────────────────────────────────────────────────────
async function migrateCoding() {
  console.log('\n📦 Migrating coding attempts...');
  const records = await MongoCoding.find().lean();

  for (const r of records) {
    const uuid   = getUUID(r._id);
    const userId = getUUID(r.userId);

    try {
      const { error } = await sb.from('coding_attempts').upsert({
        id:                uuid,
        user_id:           userId,
        problem_id:        r.problemId        || 1,
        problem_title:     r.problemTitle     || 'Unknown Problem',
        difficulty:        r.difficulty       || 'Easy',
        category:          r.category         || 'Arrays',
        language:          r.language         || 'Java',
        code:              r.code             || '',
        status:            r.status           || 'FAILED',
        score:             r.score            || 0,
        passed_test_cases: r.passedTestCases  || 0,
        total_test_cases:  r.totalTestCases   || 0,
        execution_time_ms: r.executionTimeMs  || 0,
        created_at:        r.createdAt        || new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) { stats.errors.push(`Coding ${r._id}: ${error.message}`); continue; }
      stats.coding++;
    } catch (err) {
      stats.errors.push(`Coding ${r._id}: ${err.message}`);
    }
  }
  console.log(`   ✅ ${stats.coding} coding attempts migrated`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6 — Migrate Communication Attempts
// ─────────────────────────────────────────────────────────────────────────────
async function migrateCommunication() {
  console.log('\n📦 Migrating communication attempts...');
  const records = await MongoComm.find().lean();

  for (const r of records) {
    const uuid   = getUUID(r._id);
    const userId = getUUID(r.userId);

    try {
      const { error } = await sb.from('communication_attempts').upsert({
        id:               uuid,
        user_id:          userId,
        input_text:       r.inputText        || '',
        word_count:       r.wordCount        || 0,
        grammar_score:    r.grammarScore     || 0,
        clarity_score:    r.clarityScore     || 0,
        vocabulary_score: r.vocabularyScore  || 0,
        confidence_score: r.confidenceScore  || 0,
        relevance_score:  r.relevanceScore   || 0,
        overall_score:    r.overallScore     || 0,
        mistakes:         r.mistakes         || [],
        improved_answer:  r.improvedAnswer   || '',
        created_at:       r.createdAt        || new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) { stats.errors.push(`Communication ${r._id}: ${error.message}`); continue; }
      stats.communication++;
    } catch (err) {
      stats.errors.push(`Communication ${r._id}: ${err.message}`);
    }
  }
  console.log(`   ✅ ${stats.communication} communication attempts migrated`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 7 — Migrate Learning Paths
// ─────────────────────────────────────────────────────────────────────────────
async function migrateLearningPaths() {
  console.log('\n📦 Migrating learning paths...');
  const records = await MongoPath.find().lean();

  for (const r of records) {
    const uuid   = getUUID(r._id);
    const userId = getUUID(r.userId);

    try {
      const { error } = await sb.from('learning_paths').upsert({
        id:            uuid,
        user_id:       userId,
        path_key:      r.pathKey      || 'java-dsa',
        title:         r.title        || '',
        description:   r.description  || '',
        reason:        r.reason       || '',
        icon:          r.icon         || '📚',
        color:         r.color        || '#7c3aed',
        level:         r.level        || 'Beginner',
        priority:      r.priority     || 'Medium',
        trigger_score: r.triggerScore || 0,
        progress:      r.progress     || 0,
        started:       r.started      || false,
        started_at:    r.startedAt    || null,
        completed_at:  r.completedAt  || null,
        created_at:    r.createdAt    || new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) { stats.errors.push(`LearningPath ${r._id}: ${error.message}`); continue; }

      // Topics
      if (r.topics?.length) {
        const rows = r.topics.map((t, idx) => ({
          path_id:            uuid,
          topic_key:          t.topicId    || `topic_${idx}`,
          title:              t.title      || '',
          description:        t.description|| '',
          resources:          t.resources  || [],
          practice_questions: t.practiceQuestions || [],
          completed:          t.completed  || false,
          completed_at:       t.completedAt|| null,
          sort_order:         idx,
        }));
        await sb.from('learning_path_topics').delete().eq('path_id', uuid);
        await sb.from('learning_path_topics').insert(rows);
      }

      stats.learningPaths++;
    } catch (err) {
      stats.errors.push(`LearningPath ${r._id}: ${err.message}`);
    }
  }
  console.log(`   ✅ ${stats.learningPaths} learning paths migrated`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 8 — Migrate Skill Assessments
// ─────────────────────────────────────────────────────────────────────────────
async function migrateSkills() {
  console.log('\n📦 Migrating skill assessments...');
  const records = await MongoSkill.find().lean();

  for (const r of records) {
    const uuid   = getUUID(r._id);
    const userId = getUUID(r.userId);

    try {
      const { error } = await sb.from('skill_assessments').upsert({
        id:              uuid,
        user_id:         userId,
        current_skills:  r.currentSkills  || [],
        skill_gaps:      r.skillGaps      || [],
        recommendations: r.recommendations|| [],
        score_snapshot:  r.scoreSnapshot  || {},
        created_at:      r.createdAt      || new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) { stats.errors.push(`Skill ${r._id}: ${error.message}`); continue; }
      stats.skills++;
    } catch (err) {
      stats.errors.push(`Skill ${r._id}: ${err.message}`);
    }
  }
  console.log(`   ✅ ${stats.skills} skill assessments migrated`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Starting MongoDB → Supabase migration...');
  console.log(`   MongoDB: ${MONGODB_URI}`);
  console.log(`   Supabase: ${SUPABASE_URL}\n`);

  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  // Run all migrations in order (users first — FK dependencies)
  await migrateUsers();
  await migrateResumes();
  await migrateInterviews();
  await migrateAptitude();
  await migrateCoding();
  await migrateCommunication();
  await migrateLearningPaths();
  await migrateSkills();

  await mongoose.disconnect();

  // Final report
  console.log('\n════════════════════════════════════════');
  console.log('  Migration Complete');
  console.log('════════════════════════════════════════');
  console.log(`  Users:             ${stats.users}`);
  console.log(`  Resumes:           ${stats.resumes}`);
  console.log(`  Interviews:        ${stats.interviews}`);
  console.log(`  Aptitude attempts: ${stats.aptitude}`);
  console.log(`  Coding attempts:   ${stats.coding}`);
  console.log(`  Communication:     ${stats.communication}`);
  console.log(`  Learning paths:    ${stats.learningPaths}`);
  console.log(`  Skill assessments: ${stats.skills}`);
  console.log(`  Errors:            ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    stats.errors.slice(0, 20).forEach(e => console.log(`   - ${e}`));
    if (stats.errors.length > 20) console.log(`   ... and ${stats.errors.length - 20} more`);
  }

  console.log('\n✅ MongoDB data preserved — nothing deleted.');
  console.log('   Update SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY in .env to activate the new DB.\n');
}

main().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
