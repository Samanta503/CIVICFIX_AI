USE civicfix_ai;

-- =====================================================
-- BASIC DATABASE CHECK
-- =====================================================

SHOW TABLES;

SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_complaints FROM complaints;
SELECT COUNT(*) AS total_media FROM complaint_media;
SELECT COUNT(*) AS total_ai_predictions FROM complaint_ai_predictions;
SELECT COUNT(*) AS total_duplicate_suggestions FROM complaint_duplicate_suggestions;
SELECT COUNT(*) AS total_image_analyses FROM complaint_media_ai_analyses;
SELECT COUNT(*) AS total_notifications FROM notification_logs;


-- =====================================================
-- USERS AND ROLES CHECK
-- =====================================================

SELECT 
    u.id,
    u.name,
    u.email,
    r.name AS role_name,
    r.slug AS role_slug,
    u.created_at
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
ORDER BY u.id;


-- =====================================================
-- COMPLAINTS CHECK
-- =====================================================

SELECT 
    c.id,
    c.complaint_no,
    c.title,
    c.status,
    c.priority,
    citizen.name AS citizen_name,
    cat.name AS category_name,
    d.name AS department_name,
    z.name AS zone_name,
    c.submitted_at,
    c.sla_due_at
FROM complaints c
LEFT JOIN users citizen ON citizen.id = c.citizen_id
LEFT JOIN complaint_categories cat ON cat.id = c.category_id
LEFT JOIN departments d ON d.id = c.department_id
LEFT JOIN zones z ON z.id = c.zone_id
ORDER BY c.id DESC;


-- =====================================================
-- CHUNK 17: AI RULE-BASED CLASSIFIER CHECK
-- =====================================================

SELECT 
    p.id,
    p.complaint_id,
    c.complaint_no,
    c.title,
    p.predicted_category_id,
    cat.name AS predicted_category,
    p.predicted_department_id,
    d.name AS predicted_department,
    p.predicted_priority,
    p.confidence_score,
    p.model_name,
    p.predicted_summary,
    p.reasoning,
    p.matched_keywords,
    p.created_at
FROM complaint_ai_predictions p
LEFT JOIN complaints c ON c.id = p.complaint_id
LEFT JOIN complaint_categories cat ON cat.id = p.predicted_category_id
LEFT JOIN departments d ON d.id = p.predicted_department_id
ORDER BY p.id DESC;


-- =====================================================
-- CHUNK 18: DUPLICATE DETECTION CHECK
-- =====================================================

SELECT 
    ds.id,
    source.complaint_no AS source_complaint,
    source.title AS source_title,
    matched.complaint_no AS matched_complaint,
    matched.title AS matched_title,
    ds.similarity_score,
    ds.text_similarity_score,
    ds.location_similarity_score,
    ds.category_similarity_score,
    ds.distance_meters,
    ds.status,
    ds.review_note,
    ds.reviewed_at,
    ds.created_at
FROM complaint_duplicate_suggestions ds
LEFT JOIN complaints source ON source.id = ds.source_complaint_id
LEFT JOIN complaints matched ON matched.id = ds.matched_complaint_id
ORDER BY ds.id DESC;


-- Pending duplicate suggestions
SELECT 
    ds.id,
    source.complaint_no AS source_complaint,
    matched.complaint_no AS matched_complaint,
    ds.similarity_score,
    ds.status
FROM complaint_duplicate_suggestions ds
LEFT JOIN complaints source ON source.id = ds.source_complaint_id
LEFT JOIN complaints matched ON matched.id = ds.matched_complaint_id
WHERE ds.status = 'pending'
ORDER BY ds.similarity_score DESC;


-- Confirmed duplicate suggestions
SELECT 
    ds.id,
    source.complaint_no AS duplicate_complaint,
    matched.complaint_no AS original_or_matched_complaint,
    ds.similarity_score,
    ds.review_note,
    reviewer.name AS reviewed_by,
    ds.reviewed_at
FROM complaint_duplicate_suggestions ds
LEFT JOIN complaints source ON source.id = ds.source_complaint_id
LEFT JOIN complaints matched ON matched.id = ds.matched_complaint_id
LEFT JOIN users reviewer ON reviewer.id = ds.reviewed_by
WHERE ds.status = 'confirmed'
ORDER BY ds.reviewed_at DESC;


-- =====================================================
-- CHUNK 18.1: DUPLICATE CITIZEN NOTIFICATION CHECK
-- =====================================================

SELECT 
    id,
    user_id,
    complaint_id,
    type,
    title,
    message,
    action_url,
    email_to,
    email_status,
    sent_at,
    created_at
FROM notification_logs
WHERE type = 'duplicate_complaint_confirmed'
ORDER BY id DESC;


-- Complaint status history for duplicate confirmation
SELECT 
    h.id,
    c.complaint_no,
    h.old_status,
    h.new_status,
    h.note,
    u.name AS changed_by,
    h.created_at
FROM complaint_status_histories h
LEFT JOIN complaints c ON c.id = h.complaint_id
LEFT JOIN users u ON u.id = h.changed_by
WHERE h.note LIKE '%Duplicate confirmed%'
ORDER BY h.id DESC;


-- =====================================================
-- CHUNK 19: AI IMAGE ANALYSIS CHECK
-- =====================================================

SELECT 
    a.id,
    c.complaint_no,
    c.title,
    a.complaint_media_id,
    a.detected_issue_type,
    a.visual_severity,
    a.confidence_score,
    a.quality_score,
    a.image_width,
    a.image_height,
    a.file_size_bytes,
    a.mime_type,
    a.status,
    a.analysis_summary,
    a.safety_observations,
    a.created_at
FROM complaint_media_ai_analyses a
LEFT JOIN complaints c ON c.id = a.complaint_id
ORDER BY a.id DESC;


-- Image analysis with media path
SELECT 
    a.id,
    c.complaint_no,
    m.id AS media_id,
    m.file_path,
    a.detected_issue_type,
    a.visual_severity,
    a.confidence_score,
    a.quality_score,
    a.status,
    a.created_at
FROM complaint_media_ai_analyses a
LEFT JOIN complaints c ON c.id = a.complaint_id
LEFT JOIN complaint_media m ON m.id = a.complaint_media_id
ORDER BY a.id DESC;


-- Pending image analysis review
SELECT 
    a.id,
    c.complaint_no,
    a.detected_issue_type,
    a.visual_severity,
    a.confidence_score,
    a.quality_score,
    a.status
FROM complaint_media_ai_analyses a
LEFT JOIN complaints c ON c.id = a.complaint_id
WHERE a.status = 'pending'
ORDER BY a.confidence_score DESC;


-- Critical/high image analysis results
SELECT 
    a.id,
    c.complaint_no,
    c.title,
    a.detected_issue_type,
    a.visual_severity,
    a.confidence_score,
    a.safety_observations,
    a.created_at
FROM complaint_media_ai_analyses a
LEFT JOIN complaints c ON c.id = a.complaint_id
WHERE a.visual_severity IN ('critical', 'high')
ORDER BY a.confidence_score DESC;


-- =====================================================
-- NOTIFICATION CHECK
-- =====================================================

SELECT 
    n.id,
    receiver.name AS receiver_name,
    receiver.email AS receiver_email,
    sender.name AS sender_name,
    c.complaint_no,
    n.type,
    n.channel,
    n.title,
    n.message,
    n.action_url,
    n.email_status,
    n.sent_at,
    n.created_at
FROM notification_logs n
LEFT JOIN users receiver ON receiver.id = n.user_id
LEFT JOIN users sender ON sender.id = n.sender_id
LEFT JOIN complaints c ON c.id = n.complaint_id
ORDER BY n.id DESC;


-- =====================================================
-- SLA ESCALATION CHECK
-- =====================================================

SELECT 
    e.id,
    c.complaint_no,
    c.title,
    e.escalation_level,
    e.reason,
    e.status,
    e.created_at,
    e.resolved_at
FROM sla_escalations e
LEFT JOIN complaints c ON c.id = e.complaint_id
ORDER BY e.id DESC;


-- =====================================================
-- FEEDBACK CHECK
-- =====================================================

SELECT 
    f.id,
    c.complaint_no,
    c.title,
    citizen.name AS citizen_name,
    f.rating,
    f.response_quality,
    f.issue_resolved,
    f.comment,
    f.created_at
FROM complaint_feedback f
LEFT JOIN complaints c ON c.id = f.complaint_id
LEFT JOIN users citizen ON citizen.id = f.citizen_id
ORDER BY f.id DESC;

USE civicfix_ai;

SELECT 
    status,
    COUNT(*) AS total
FROM complaints
GROUP BY status
ORDER BY total DESC;

SELECT 
    priority,
    COUNT(*) AS total
FROM complaints
GROUP BY priority
ORDER BY total DESC;

SELECT 
    z.name AS zone_name,
    COUNT(c.id) AS total_complaints,
    SUM(CASE WHEN c.status NOT IN ('resolved', 'closed', 'rejected') THEN 1 ELSE 0 END) AS open_total,
    SUM(CASE WHEN c.priority IN ('high', 'critical') THEN 1 ELSE 0 END) AS high_risk_total,
    SUM(CASE WHEN c.sla_due_at IS NOT NULL 
             AND c.sla_due_at < NOW()
             AND c.status NOT IN ('resolved', 'closed', 'rejected')
        THEN 1 ELSE 0 END) AS overdue_total
FROM complaints c
LEFT JOIN zones z ON z.id = c.zone_id
GROUP BY z.id, z.name
ORDER BY total_complaints DESC;

SELECT 
    c.id,
    c.complaint_no,
    c.title,
    c.priority,
    c.status,
    c.latitude,
    c.longitude,
    z.name AS zone_name
FROM complaints c
LEFT JOIN zones z ON z.id = c.zone_id
WHERE c.latitude IS NOT NULL
AND c.longitude IS NOT NULL
ORDER BY c.id DESC;
