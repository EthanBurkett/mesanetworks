const { MongoClient, ObjectId } = require("mongodb");

async function updatePunches() {
  const client = new MongoClient("mongodb://localhost:27017/mesanetworks");

  try {
    await client.connect();
    const db = client.db();

    const shiftId = "6934c4547258ddf20a5c4ee9";
    const baseTime = new Date("2025-12-07T00:09:16.925Z");

    // Find all punches for this shift
    const punches = await db
      .collection("punches")
      .find({ shiftId })
      .sort({ timestamp: 1 })
      .toArray();

    console.log("Found", punches.length, "punches");

    if (punches.length === 4) {
      const [clockIn, breakStart, breakEnd, clockOut] = punches;

      // Update timestamps: 60min total, 10min break at 30min mark
      const updates = [
        {
          _id: clockIn._id,
          timestamp: baseTime, // 00:09:16
        },
        {
          _id: breakStart._id,
          timestamp: new Date(baseTime.getTime() + 30 * 60 * 1000), // 00:39:16 (30min work)
        },
        {
          _id: breakEnd._id,
          timestamp: new Date(baseTime.getTime() + 40 * 60 * 1000), // 00:49:16 (10min break)
        },
        {
          _id: clockOut._id,
          timestamp: new Date(baseTime.getTime() + 60 * 60 * 1000), // 01:09:16 (20min work)
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

      // Update shift with correct totals
      const breakMinutes = 10;
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

      console.log("\n✅ Updated shift - 60min total, 10min break, 50min work");

      // Verify punches
      const updated = await db
        .collection("punches")
        .find({ shiftId })
        .sort({ timestamp: 1 })
        .toArray();

      console.log("\nVerified punches:");
      updated.forEach((p) => {
        console.log("-", p.type, "at", new Date(p.timestamp).toISOString());
      });
    } else {
      console.log("❌ Expected 4 punches, found", punches.length);
    }
  } finally {
    await client.close();
  }
}

updatePunches().catch(console.error);
