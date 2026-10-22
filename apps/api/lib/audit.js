import connectMongo from "@/services/mongo";
import AuditLog from "@/app/models/AuditLog";

/**
 * Records an immutable audit log entry.
 *
 * @param {Object} actor - User/staff executing the action ({ _id, customer_name, email, role })
 * @param {string} action - Action identifier (e.g. 'update_integration', 'delete_page')
 * @param {string} entity - Target collection/domain ('Integration', 'Page', 'SiteSettings')
 * @param {string} entityId - Target document identifier or slug
 * @param {string} summary - Human-readable summary of the action
 * @param {Object} [diff] - Key changes (never include plaintext secrets)
 * @param {string} [ip] - Client IP address
 * @returns {Promise<Object|null>} Created audit log record
 */
export async function logAudit(
  actor,
  action,
  entity,
  entityId,
  summary,
  diff = null,
  ip = ""
) {
  try {
    await connectMongo();
    return await AuditLog.create({
      actor: {
        id: actor?._id || actor?.id || null,
        name: actor?.customer_name || actor?.name || "System",
        email: actor?.email || "",
        role: actor?.role || "system",
      },
      action,
      entity,
      entityId: String(entityId || ""),
      summary,
      diff,
      ip,
    });
  } catch (err) {
    console.error("logAudit error:", err.message);
    return null;
  }
}

export default logAudit;
