require('dotenv').config();
const { MongoClient } = require('mongodb');

async function fixShift() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Find the shift with 0 totalMinutes but has actualStart and actualEnd
    const shift = await db.collection('shifts').findOne({
      totalMinutes: 0,
      actualStart: { $exists: true },
      actualEnd: { $exists: true }
    });
    
    if (shift) {
      console.log('Found shift:', shift._id);
      console.log('actualStart:', shift.actualStart);
      console.log('actualEnd:', shift.actualEnd);
      console.log('breakMinutes:', shift.breakMinutes);
      
      const totalMs = new Date(shift.actualEnd).getTime() - new Date(shift.actualStart).getTime();
      const totalMinutes = Math.max(Math.floor(totalMs / 60000) - (shift.breakMinutes || 0), 0);
      
      console.log('Calculated totalMinutes:', totalMinutes);
      
      const result = await db.collection('shifts').updateOne(
        { _id: shift._id },
        { $set: { totalMinutes } }
      );
      
      console.log('Updated:', result.modifiedCount, 'shift(s)');
      console.log('Refresh your browser to see the updated hours!');
    } else {
      console.log('No shift found to fix');
    }
  } finally {
    await client.close();
  }
}

fixShift().catch(console.error);
