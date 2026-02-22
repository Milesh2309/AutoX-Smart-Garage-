const { getDB } = require('../config/db');

const getNextAssignmentId = async (db) => {
  const [last] = await db.collection('assignments').find({ id: { $type: 'number' } }).sort({ id: -1 }).limit(1).toArray();
  return (last?.id || 0) + 1;
};

exports.createAssignment = async (req, res, next) => {
  try {
    const db = getDB();
    const { bookingId, mechanicId, notes } = req.body;

    if (!bookingId || !mechanicId) {
      return res.status(400).json({ error: 'bookingId and mechanicId are required' });
    }

    const newAssignment = {
      id: await getNextAssignmentId(db),
      bookingId: Number(bookingId),
      mechanicId: Number(mechanicId),
      notes,
      status: 'assigned',
      createdAt: new Date().toISOString()
    };

    await db.collection('assignments').insertOne(newAssignment);
    return res.status(201).json(newAssignment);
  } catch (error) {
    return next(error);
  }
};

exports.getAssignmentById = async (req, res, next) => {
  try {
    const db = getDB();
    const assignment = await db.collection('assignments').findOne({ id: Number(req.params.id) });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    return res.json(assignment);
  } catch (error) {
    return next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const { status, notes } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const result = await db.collection('assignments').updateOne({ id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignment = await db.collection('assignments').findOne({ id });
    return res.json(assignment);
  } catch (error) {
    return next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const assignment = await db.collection('assignments').findOne({ id });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await db.collection('assignments').deleteOne({ id });
    return res.json({ message: 'Assignment deleted', deleted: assignment });
  } catch (error) {
    return next(error);
  }
};

exports.getMechanicAssignments = async (req, res, next) => {
  try {
    const db = getDB();
    const mechanicAssignments = await db.collection('assignments').find({ mechanicId: Number(req.params.mechanicId) }).toArray();

    if (mechanicAssignments.length === 0) {
      return res.status(404).json({ message: 'No assignments found for mechanic' });
    }

    return res.json(mechanicAssignments);
  } catch (error) {
    return next(error);
  }
};

exports.getJobProgress = async (req, res, next) => {
  try {
    const db = getDB();
    const assignment = await db.collection('assignments').findOne({ id: Number(req.params.id) });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const progress = {
      assignmentId: assignment.id,
      status: assignment.status,
      timeline: [
        { stage: 'Assigned', completed: true, timestamp: assignment.createdAt },
        { stage: 'In Progress', completed: assignment.status === 'in-progress' || assignment.status === 'completed' },
        { stage: 'Completed', completed: assignment.status === 'completed' }
      ]
    };

    return res.json(progress);
  } catch (error) {
    return next(error);
  }
};
