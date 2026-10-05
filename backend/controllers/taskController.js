const Task = require('../models/Task');

// @desc    Get all user tasks (with precision filtering and sorting)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
    try {
        const { filter, sort, clientDate } = req.query;
        let query = { userId: req.user.id };

        // --- Timezone-Aware Precision ---
        // clientDate: YYYY-MM-DD from the user's LOCAL calendar
        let now;
        if (clientDate) {
            const [year, month, day] = clientDate.split('-').map(Number);
            // Create a Date object representing the start of that day in UTC
            now = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        } else {
            const serverNow = new Date();
            now = new Date(Date.UTC(serverNow.getUTCFullYear(), serverNow.getUTCMonth(), serverNow.getUTCDate(), 0, 0, 0, 0));
        }
        
        // Start and end of "Today" (UTC boundaries for that calendar day)
        const startOfToday = new Date(now);
        const endOfToday = new Date(now);
        endOfToday.setUTCHours(23, 59, 59, 999);

        // Start and end of "Yesterday"
        const startOfYesterday = new Date(now);
        startOfYesterday.setUTCDate(now.getUTCDate() - 1);
        const endOfYesterday = new Date(startOfYesterday);
        endOfYesterday.setUTCHours(23, 59, 59, 999);

        // Filtering Logic
        if (filter === 'today') {
            query.dueDate = { $gte: startOfToday, $lte: endOfToday };
        } else if (filter === 'yesterday') {
            query.dueDate = { $gte: startOfYesterday, $lte: endOfYesterday };
        } else if (filter === 'week') {
            // Next 7 days from TODAY
            const nextWeek = new Date(startOfToday);
            nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
            nextWeek.setUTCHours(23, 59, 59, 999);
            query.dueDate = { $gte: startOfToday, $lte: nextWeek };
        } else if (filter === 'overdue') {
            // All tasks (any status) whose dueDate is strictly before today
            query.dueDate = { $lt: startOfToday };
        } else if (filter === 'completed') {
            query.status = 'completed';
        } else if (filter === 'pending') {
            query.status = 'pending';
        }

        let tasks = await Task.find(query);

        // Sorting Logic (Numeric-based for absolute accuracy)
        if (sort === 'priority') {
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            tasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
        } else {
            // Nearest Due Date First
            tasks.sort((a, b) => {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                return dateA - dateB;
            });
        }

        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
    try {
        const { title, description, status, dueDate, priority } = req.body;

        // Ensure authenticated user is present
        if (!req.user || !req.user.id) {
            res.status(401);
            throw new Error('Not authorized');
        }

        if (!title || !description || !dueDate) {
            res.status(400);
            throw new Error('Please add a title, description, and due date');
        }

        // Coerce and validate dueDate
        const parsedDueDate = new Date(dueDate);
        if (isNaN(parsedDueDate.getTime())) {
            res.status(400);
            throw new Error('Invalid dueDate format');
        }

        const allowedPriorities = ['Low', 'Medium', 'High'];
        const finalPriority = allowedPriorities.includes(priority) ? priority : 'Medium';

        const task = await Task.create({
            title,
            description,
            status: status || 'pending',
            userId: req.user.id,
            dueDate: parsedDueDate,
            priority: finalPriority
        });

        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        // Ensure user owns the task
        if (task.userId.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        const { title, description, status, dueDate, priority } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { title, description, status, dueDate, priority }, 
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        // Ensure user owns the task
        if (task.userId.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await task.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
