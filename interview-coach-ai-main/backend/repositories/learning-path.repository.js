import { getSupabase } from '../config/supabase.js';

export const learningPathRepository = {

  // Batch fetch — avoids N+1 queries
  async findByUser(userId, pathKeys = null) {
    const sb = getSupabase();
    let query = sb.from('learning_paths').select('*').eq('user_id', userId);
    if (pathKeys && pathKeys.length > 0) query = query.in('path_key', pathKeys);
    const { data: paths, error } = await query;
    if (error) throw error;
    if (!paths || paths.length === 0) return [];

    // Fetch all topics for all paths in one query
    const pathIds = paths.map(p => p.id);
    const { data: allTopics } = await sb
      .from('learning_path_topics')
      .select('*')
      .in('path_id', pathIds)
      .order('sort_order', { ascending: true });

    const topicsByPath = {};
    for (const t of (allTopics || [])) {
      if (!topicsByPath[t.path_id]) topicsByPath[t.path_id] = [];
      topicsByPath[t.path_id].push(t);
    }

    return paths.map(p => ({ ...p, topics: topicsByPath[p.id] || [] }));
  },

  async findById(id) {
    const sb = getSupabase();
    const [pathRes, topicsRes] = await Promise.all([
      sb.from('learning_paths').select('*').eq('id', id).single(),
      sb.from('learning_path_topics').select('*').eq('path_id', id).order('sort_order'),
    ]);
    if (!pathRes.data) return null;
    return { ...pathRes.data, topics: topicsRes.data || [] };
  },

  async findByPathKey(userId, pathKey) {
    const sb = getSupabase();
    const { data: path, error } = await sb
      .from('learning_paths')
      .select('*')
      .eq('user_id', userId)
      .eq('path_key', pathKey)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!path) return null;
    const { data: topics } = await sb
      .from('learning_path_topics')
      .select('*')
      .eq('path_id', path.id)
      .order('sort_order');
    return { ...path, topics: topics || [] };
  },

  async create(userId, pathData, topics) {
    const sb = getSupabase();
    const { data: path, error } = await sb
      .from('learning_paths')
      .insert({
        user_id:       userId,
        path_key:      pathData.pathKey,
        title:         pathData.title,
        description:   pathData.description || '',
        reason:        pathData.reason      || '',
        icon:          pathData.icon        || '📚',
        color:         pathData.color       || '#7c3aed',
        level:         pathData.level       || 'Beginner',
        priority:      pathData.priority    || 'Medium',
        trigger_score: pathData.triggerScore || 0,
        progress:      0,
        started:       false,
      })
      .select()
      .single();
    if (error) throw error;

    if (topics && topics.length > 0) {
      const rows = topics.map((t, idx) => ({
        path_id:            path.id,
        topic_key:          t.topicId || `topic_${idx}`,
        title:              t.title,
        description:        t.description        || '',
        resources:          t.resources          || [],
        practice_questions: t.practiceQuestions  || [],
        completed:          false,
        sort_order:         idx,
      }));
      const { error: topicErr } = await sb.from('learning_path_topics').insert(rows);
      if (topicErr) throw topicErr;
    }
    return path;
  },

  async updateTopicCompletion(pathId, topicId, completed) {
    const sb = getSupabase();
    const { error } = await sb
      .from('learning_path_topics')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', topicId)
      .eq('path_id', pathId);
    if (error) throw error;

    // Recompute progress
    const { data: allTopics } = await sb
      .from('learning_path_topics')
      .select('completed')
      .eq('path_id', pathId);
    const total    = allTopics?.length || 0;
    const done     = allTopics?.filter(t => t.completed).length || 0;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    await sb.from('learning_paths').update({
      progress,
      started:      done > 0,
      started_at:   done > 0 ? new Date().toISOString() : null,
      completed_at: progress === 100 ? new Date().toISOString() : null,
    }).eq('id', pathId);

    return { completedTopics: done, totalTopics: total, percentage: progress };
  },

  async updateTopicByIndex(pathId, topicIndex, completed) {
    const sb = getSupabase();
    // Get all topics sorted by sort_order
    const { data: topics, error } = await sb
      .from('learning_path_topics')
      .select('id')
      .eq('path_id', pathId)
      .order('sort_order');
    if (error) throw error;
    if (!topics || topicIndex >= topics.length) {
      throw new Error(`Topic index ${topicIndex} out of range`);
    }
    return this.updateTopicCompletion(pathId, topics[topicIndex].id, completed);
  },

  async markStarted(pathId) {
    const sb = getSupabase();
    const { error } = await sb.from('learning_paths').update({
      started:    true,
      started_at: new Date().toISOString(),
    }).eq('id', pathId);
    if (error) throw error;
  },
};
