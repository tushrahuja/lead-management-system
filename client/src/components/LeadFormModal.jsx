import { useState, useEffect } from 'react';
import api from '../services/api';

const LeadFormModal = ({ isOpen, onClose, leadData, onSave }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        city: '',
        state: '',
        source: '',
        status: 'new',
        score: '',
        lead_value: '',
        is_qualified: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (leadData) {
            // Edit mode - populate form with existing data
            setFormData({
                first_name: leadData.first_name || '',
                last_name: leadData.last_name || '',
                email: leadData.email || '',
                phone: leadData.phone || '',
                company: leadData.company || '',
                city: leadData.city || '',
                state: leadData.state || '',
                source: leadData.source || '',
                status: leadData.status || 'new',
                score: leadData.score || '',
                lead_value: leadData.lead_value || '',
                is_qualified: leadData.is_qualified || false
            });
        } else {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                company: '',
                city: '',
                state: '',
                source: '',
                status: 'new',
                score: '',
                lead_value: '',
                is_qualified: false
            });
        }
        setError('');
    }, [leadData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (leadData && leadData._id) {
                await api.put(`/api/leads/${leadData._id}`, formData);
            } else {
                await api.post('/api/leads', formData);
            }
            
            onSave();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while saving the lead');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {leadData ? 'Edit Lead' : 'Create New Lead'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                placeholder="Enter first name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                placeholder="Enter last name"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label>Company</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                placeholder="Enter company name"
                            />
                        </div>

                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="Enter city"
                            />
                        </div>

                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="Enter state"
                            />
                        </div>

                        <div className="form-group">
                            <label>Source</label>
                            <select
                                name="source"
                                value={formData.source}
                                onChange={handleInputChange}
                            >
                                <option value="">Select source</option>
                                <option value="website">Website</option>
                                <option value="facebook_ads">Facebook Ads</option>
                                <option value="google_ads">Google Ads</option>
                                <option value="referral">Referral</option>
                                <option value="events">Events</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="lost">Lost</option>
                                <option value="won">Won</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Score (0-100)</label>
                            <input
                                type="number"
                                name="score"
                                value={formData.score}
                                onChange={handleInputChange}
                                placeholder="Enter score"
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="form-group">
                            <label>Lead Value ($)</label>
                            <input
                                type="number"
                                name="lead_value"
                                value={formData.lead_value}
                                onChange={handleInputChange}
                                placeholder="Enter lead value"
                                min="0"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Lead Qualification</label>
                            <div className="checkbox-group" onClick={() => setFormData(prev => ({...prev, is_qualified: !prev.is_qualified}))}>
                                <input
                                    type="checkbox"
                                    name="is_qualified"
                                    checked={formData.is_qualified}
                                    onChange={handleInputChange}
                                    id="is_qualified"
                                />
                                <span className="checkbox-label">
                                    Mark as qualified lead
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="button"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="button primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeadFormModal;
