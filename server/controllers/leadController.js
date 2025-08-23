const Lead = require('../models/Lead');

const createLead = async (req, res) => {
    try {
        const lead = await Lead.create(req.body);
        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        res.json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllLeads = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // Build dynamic filter object
        const filter = {};
        
        // Text-based filters (case-insensitive contains search)
        if (req.query.company) {
            filter.company = { $regex: req.query.company, $options: 'i' };
        }
        
        if (req.query.city) {
            filter.city = { $regex: req.query.city, $options: 'i' };
        }
        
        if (req.query.state) {
            filter.state = { $regex: req.query.state, $options: 'i' };
        }
        
        // Multi-value filters (comma-separated)
        if (req.query.status) {
            filter.status = { $in: req.query.status.split(',') };
        }
        
        if (req.query.source) {
            filter.source = { $in: req.query.source.split(',') };
        }
        
        // Score range filter
        if (req.query.score_min || req.query.score_max) {
            filter.score = {};
            if (req.query.score_min) filter.score.$gte = parseInt(req.query.score_min);
            if (req.query.score_max) filter.score.$lte = parseInt(req.query.score_max);
        }
        
        // Lead value range filter
        if (req.query.lead_value_min || req.query.lead_value_max) {
            filter.lead_value = {};
            if (req.query.lead_value_min) filter.lead_value.$gte = parseFloat(req.query.lead_value_min);
            if (req.query.lead_value_max) filter.lead_value.$lte = parseFloat(req.query.lead_value_max);
        }
        
        // Boolean filter
        if (req.query.is_qualified !== undefined) {
            filter.is_qualified = req.query.is_qualified === 'true';
        }
        
        // Created date range filter
        if (req.query.created_from || req.query.created_to) {
            filter.created_at = {};
            if (req.query.created_from) {
                filter.created_at.$gte = new Date(req.query.created_from);
            }
            if (req.query.created_to) {
                // Add 23:59:59 to include the entire day
                const toDate = new Date(req.query.created_to);
                toDate.setHours(23, 59, 59, 999);
                filter.created_at.$lte = toDate;
            }
        }
        
        // Last activity date range filter
        if (req.query.last_activity_from || req.query.last_activity_to) {
            filter.last_activity_at = {};
            if (req.query.last_activity_from) {
                filter.last_activity_at.$gte = new Date(req.query.last_activity_from);
            }
            if (req.query.last_activity_to) {
                // Add 23:59:59 to include the entire day
                const toDate = new Date(req.query.last_activity_to);
                toDate.setHours(23, 59, 59, 999);
                filter.last_activity_at.$lte = toDate;
            }
        }
        
        // Execute queries in parallel
        const [total, data] = await Promise.all([
            Lead.countDocuments(filter),
            Lead.find(filter)
                .sort({ created_at: -1 })
                .limit(limit)
                .skip(skip)
        ]);
        
        // Calculate total pages
        const totalPages = Math.ceil(total / limit);
        
        // Send response
        res.json({
            data,
            total,
            page,
            limit,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createLead,
    getLeadById,
    updateLead,
    deleteLead,
    getAllLeads
};
