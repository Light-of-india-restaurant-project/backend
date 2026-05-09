require('dotenv').config();
const mongoose = require('mongoose');

const DB_NAME = 'my-app-development';

const statusPriority = (doc) => {
  if (doc.status === 'completed') return 0;
  if (doc.status === 'confirmed') return 1;
  return 2;
};

(async () => {
  const uri = process.env.DB_URI;
  if (!uri) {
    console.error('DB_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: DB_NAME });
  const db = mongoose.connection.db;
  const orders = db.collection('orders');

  const duplicateGroups = await orders
    .aggregate([
      { $match: { paymentId: { $type: 'string', $ne: '' } } },
      {
        $group: {
          _id: '$paymentId',
          ids: { $push: '$_id' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  console.log('Duplicate paymentId groups:', duplicateGroups.length);

  let deleted = 0;

  for (const group of duplicateGroups) {
    const docs = await orders
      .find({ _id: { $in: group.ids } }, { projection: { _id: 1, status: 1, createdAt: 1, orderNumber: 1 } })
      .toArray();

    docs.sort((a, b) => {
      const byStatus = statusPriority(a) - statusPriority(b);
      if (byStatus !== 0) return byStatus;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const keep = docs[0];
    const remove = docs.slice(1).map((d) => d._id);

    if (remove.length > 0) {
      const result = await orders.deleteMany({ _id: { $in: remove } });
      deleted += result.deletedCount || 0;
      console.log(
        `paymentId=${group._id}: kept ${keep.orderNumber || keep._id}, removed ${result.deletedCount || 0} duplicate(s)`,
      );
    }
  }

  const indexes = await orders.indexes();
  const nonUniquePaymentIndex = indexes.find(
    (idx) => idx.key && idx.key.paymentId === 1 && idx.unique !== true && idx.name === 'paymentId_1',
  );

  if (nonUniquePaymentIndex) {
    await orders.dropIndex('paymentId_1');
    console.log('Dropped non-unique index paymentId_1');
  }

  await orders.createIndex(
    { paymentId: 1 },
    {
      name: 'paymentId_1',
      unique: true,
      sparse: true,
      background: true,
    },
  );

  console.log('Created unique sparse index paymentId_1');
  console.log('Deleted duplicate orders:', deleted);

  await mongoose.disconnect();
  process.exit(0);
})().catch(async (error) => {
  console.error('Failed to enforce paymentId uniqueness:', error.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
