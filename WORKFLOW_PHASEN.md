{
  "version": 7,
  "assetMatching": {
    "minimumConfidence": 0.75,
    "requireVisualReview": false,
    "requireSecondPassConfirmation": false,
    "requireSceneOrderConfirmation": false,
    "requireMatchReason": false,
    "minimumMatchReasonLength": 0,
    "requireVisibleSummary": false,
    "minimumVisibleSummaryLength": 0,
    "requiredSceneComparedFields": [],
    "requiredCoverComparedFields": [],
    "forbidFilenameOnlyMatching": false,
    "allowedMatchMethods": [
      "numbered-global-image-order",
      "chronological-filename-plus-visual-spot-check",
      "filename-only",
      "visual-content-review",
      "visual-text-and-content-review"
    ],
    "leaveUnmatchedWhenUncertain": false,
    "blockOnlyOnRealConflict": true,
    "guidance": "Vollständige zweistellig nummerierte Bilder werden anhand ihrer globalen Bildreihenfolge automatisch geroutet. Danach reicht ein schneller visueller Spot-Check auf offensichtliche Inhalts-/Stilfehler. Keine schriftliche Begründung und kein zweiter Prüfpass pro Bild."
  },
  "sceneTiming": {
    "hookSeconds": {"min": 4.5, "max": 6.0},
    "standardSeconds": {"min": 6.0, "max": 7.5},
    "finalSceneSecondsIncludingHold": {"min": 5.8, "max": 8.2},
    "maximumAdjacentDifferenceSeconds": 2.5,
    "postVoiceHoldSeconds": 0.6,
    "postVoiceHoldRangeSeconds": {"min": 0.5, "max": 0.7},
    "strictTimelineBalance": true,
    "minimumImagePhaseSeconds": 2.2,
    "recommendedImagePhaseSeconds": {"min": 2.5, "max": 3.8},
    "splitReviewThresholdSeconds": 4.8,
    "guidance": "Adaptive-Dense-V2-Reels dürfen mehr Bildphasen besitzen. Inhalt und Audio entscheiden; keine starre 3-Sekunden-Mindestregel mehr."
  },
  "editTiming": {
    "sceneCueLeadSeconds": 0.1,
    "imageCueLeadSeconds": 0.08,
    "sfxPreRollSeconds": 0.04,
    "sceneChangeSfxPreRollSeconds": 0.04,
    "maximumCutLeadSeconds": 0.12,
    "guidance": "Neue Bilder sollen am gesprochenen Cue oder minimal davor erscheinen. Standard: Bildschnitt 0,08 s vor dem Cue; ein kurzer Wechsel-SFX startet weitere 0,04 s davor."
  },
  "visualContinuity": {
    "requireSceneMeaningMatch": true,
    "requireSceneOrderConfirmed": true,
    "requirePlannedGermanTextExact": true,
    "forbidUnexpectedReadableText": true,
    "requireSingleWorldLock": true,
    "forbidDecorativeTinyBallActors": true,
    "preferSubjectOnlyWhenActorAddsNoMeaning": true,
    "singlePassVisualQc": true
  }
}
