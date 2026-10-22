import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Counter =
  mongoose.models.Counter ?? mongoose.model("Counter", counterSchema);

/**
 * Atomically generates the next formatted order number: MS-YYMMDD-######.
 * Resets sequence to 1 each day.
 *
 * @param {mongoose.ClientSession} [session] - Optional Mongoose transaction session
 * @param {Date} [now=new Date()]
 * @returns {Promise<string>} e.g. "MS-261022-000142"
 */
export async function getNextOrderNumber(session = null, now = new Date()) {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateKey = `${yy}${mm}${dd}`; // e.g. "261022"
  const counterId = `order_${dateKey}`;

  const options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  };
  if (session) {
    options.session = session;
  }

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    options
  );

  const seqStr = String(counter.seq).padStart(6, "0");
  return `MS-${dateKey}-${seqStr}`;
}

export default Counter;
