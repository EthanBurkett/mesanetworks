const { MongoClient, ObjectId } = require("mongodb");

async function updateBreakTime() {
  const client = new MongoClient("mongodb://localhost:27017/mesanetworks");

  try {
    await client.connect();
    const db = client.db();

    const shiftId = "6934c4547258ddf20a5c4ee9";
    const baseTime = new Date("2025-12-07T00:09:16.925Z");

    // New schedule: 60min total, 30min break (15min work, 30min break, 15min work)
    // Clock In: 00:09:16
    // Work for 15 min
    // Break Start: 00:24:16 (15min work)
    // Break for 30 min
    // Break End: 00:54:16 (30min break)
    // Work for 15 min
    // Clock Out: 01:09:16 (15min work)
    // Total: 30 min work, 30 min break

    const punches = await db
      .collection("punches")
      .find({ shiftId })
      .sort({ timestamp: 1 })
      .toArray();

    console.log("Found", punches.length, "punches");

    if (punches.length === 4) {
      const [clockIn, breakStart, breakEnd, clockOut] = punches;

      const updates = [
        {
          _id: clockIn._id,
          timestamp: baseTime, // 00:09:16
        },
        {
          _id: breakStart._id,
          timestamp: new Date(baseTime.getTime() + 15 * 60 * 1000), // 00:24:16 (15min work)
        },
        {
          _id: breakEnd._id,
          timestamp: new Date(baseTime.getTime() + 45 * 60 * 1000), // 00:54:16 (30min break)
        },
        {
          _id: clockOut._id,
          timestamp: new Date(baseTime.getTime() + 60 * 60 * 1000), // 01:09:16 (15min work)
        },
      ];

      for (const update of updates) {
        await db
          .collection("punches")
          .updateOne(
            { _id: update._id },
            { $set: { timestamp: update.timestamp } }
          );
        console.log(
          "Updated punch",
          update._id,
          "to",
          update.timestamp.toISOString()
        );
      }

      // Update shift with 30min break
      const breakMinutes = 30;
      const totalMs =
        new Date(baseTime.getTime() + 60 * 60 * 1000).getTime() -
        baseTime.getTime();
      const totalMinutes = Math.max(
        Math.floor(totalMs / 60000) - breakMinutes,
        0
      );

      await db.collection("shifts").updateOne(
        { _id: new ObjectId(shiftId) },
        {
          $set: {
            actualStart: baseTime,
            actualEnd: new Date(baseTime.getTime() + 60 * 60 * 1000),
            breakMinutes,
            totalMinutes,
          },
        }
      );

      console.log("\n✅ Updated shift - 60min total, 30min break, 30min work");

      // Verify
      const updated = await db
        .collection("punches")
        .find({ shiftId })
        .sort({ timestamp: 1 })
        .toArray();

      console.log("\nVerified punches:");
      updated.forEach((p) => {
        console.log("-", p.type, "at", new Date(p.timestamp).toISOString());
      });

      const shift = await db
        .collection("shifts")
        .findOne({ _id: new ObjectId(shiftId) });
      console.log("\nShift details:");
      console.log("totalMinutes:", shift.totalMinutes);
      console.log("breakMinutes:", shift.breakMinutes);
      console.log("Remaining break time:", 60 - shift.breakMinutes, "minutes");
    } else {
      console.log("❌ Expected 4 punches, found", punches.length);
    }
  } finally {
    await client.close();
  }
}

updateBreakTime().catch(console.error);
