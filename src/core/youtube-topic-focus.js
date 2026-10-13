/**
 * Future-world topic policy: restrict new independent productions without
 * invalidating legacy projects that were created under an older category set.
 * This is a category gate, not a substitute for editorial relevance/fact checks.
 */
export function evaluateYoutubeTopicFocus(meta = {}, focus = {}) {
  const active = Array.isArray(focus.primaryTopics) ? focus.primaryTopics : [];
  const effectiveSince = String(focus.effectiveSince || '2026-10-12');
  const createdAt = typeof meta.createdAt === 'string' ? meta.createdAt.trim() : '';
  // An absent/invalid creation date is NOT a way to obtain legacy privileges.
  const isLegacy = /^\d{4}-\d{2}-\d{2}$/.test(createdAt)
    && /^\d{4}-\d{2}-\d{2}$/.test(effectiveSince)
    && createdAt < effectiveSince;
  const legacy = isLegacy && Array.isArray(focus.legacyCategoriesForExistingProjects)
    ? focus.legacyCategoriesForExistingProjects : [];
  const allowedCategories = [...new Set([...active, ...legacy])];
  const explicitlyRequested = meta.explicitUserRequestedOutsideFocus === true;
  const valid = explicitlyRequested || allowedCategories.includes(meta.topicCategory);
  return {
    valid,
    isLegacy,
    explicitlyRequested,
    allowedCategories,
    error: valid ? null : `topicCategory "${meta.topicCategory ?? 'fehlend'}" liegt außerhalb des politischen Bildungs- und Geografiefokus. Eigenständige Geschichtsvideos sind ab ${effectiveSince} nicht mehr autonom erlaubt.`
  };
}
