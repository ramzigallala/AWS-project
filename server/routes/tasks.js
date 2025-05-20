const express = require('express');
const controllerTask = require('../controller/taskController');
const router = express.Router();
// @route   GET /api/tasksDone
router.get('/tasksDone', async (req, res) => {
    const userId = req.query.userId;
    try {
        const userTasks = await controllerTask.takesTasksDone(userId);
        if (!userTasks) {
            return res.status(404).json({ message: 'Nessun task trovato per questo utente' });
        }

        res.status(200).json(userTasks.tasksDone);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
module.exports = router;