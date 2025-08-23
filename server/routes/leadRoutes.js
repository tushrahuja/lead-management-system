const express = require('express');
const {
    createLead,
    getLeadById,
    updateLead,
    deleteLead,
    getAllLeads
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route('/')
    .get(getAllLeads)
    .post(createLead);

router.route('/:id')
    .get(getLeadById)
    .put(updateLead)
    .delete(deleteLead);

module.exports = router;
