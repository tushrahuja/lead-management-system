import { useState, useEffect, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LeadFormModal from '../components/LeadFormModal';

const LeadsDashboard = () => {
    const { user, logout } = useAuth();
    const gridRef = useRef();
    const [rowData, setRowData] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalLeads: 0
    });
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        company: '',
        status: '',
        source: '',
        city: '',
        state: '',
        score_min: '',
        score_max: '',
        is_qualified: '',
        created_from: '',
        created_to: '',
        last_activity_from: '',
        last_activity_to: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState(null);

    // Actions cell renderer for Edit/Delete buttons
    const ActionsCellRenderer = (params) => {
        return (
            <div className="actions-cell">
                <button 
                    className="action-btn edit-btn"
                    onClick={() => handleOpenModal(params.data)}
                    title="Edit Lead"
                >
                    <FaEdit />
                </button>
                <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(params.data._id)}
                    title="Delete Lead"
                >
                    <FaTrash />
                </button>
            </div>
        );
    };

    const columnDefs = [
        { headerName: 'First Name', field: 'first_name', sortable: true, filter: true, flex: 1, minWidth: 120 },
        { headerName: 'Last Name', field: 'last_name', sortable: true, filter: true, flex: 1, minWidth: 120 },
        { headerName: 'Email', field: 'email', sortable: true, filter: true, flex: 2, minWidth: 200 },
        { headerName: 'Company', field: 'company', sortable: true, filter: true, flex: 1.5, minWidth: 150 },
        { headerName: 'Phone', field: 'phone', sortable: true, flex: 1, minWidth: 130 },
        { headerName: 'City', field: 'city', sortable: true, filter: true, flex: 1, minWidth: 100 },
        { headerName: 'State', field: 'state', sortable: true, filter: true, flex: 0.8, minWidth: 80 },
        { headerName: 'Source', field: 'source', sortable: true, filter: true, flex: 1, minWidth: 120 },
        { 
            headerName: 'Status', 
            field: 'status', 
            sortable: true, 
            filter: true, 
            flex: 1,
            minWidth: 100,
            cellStyle: params => {
                const statusColors = {
                    'new': { backgroundColor: '#819A91', color: 'white' },
                    'contacted': { backgroundColor: '#A7C1A8', color: 'black' },
                    'qualified': { backgroundColor: '#D1D8BE', color: 'black' },
                    'lost': { backgroundColor: '#666', color: 'white' },
                    'won': { backgroundColor: '#EEEFE0', color: 'black' }
                };
                return statusColors[params.value] || {};
            }
        },
        { headerName: 'Score', field: 'score', sortable: true, filter: 'agNumberColumnFilter', flex: 0.8, minWidth: 80 },
        { 
            headerName: 'Lead Value', 
            field: 'lead_value', 
            sortable: true, 
            filter: 'agNumberColumnFilter', 
            flex: 1,
            minWidth: 120,
            valueFormatter: params => params.value ? `$${params.value.toLocaleString()}` : ''
        },
        { 
            headerName: 'Qualified', 
            field: 'is_qualified', 
            sortable: true, 
            flex: 1,
            minWidth: 100,
            cellRenderer: params => params.value ? '✓ Yes' : '✗ No'
        },
        {
            headerName: 'Actions',
            cellRenderer: ActionsCellRenderer,
            width: 100,
            maxWidth: 100,
            pinned: 'right',
            sortable: false,
            filter: false,
            resizable: false
        }
    ];

    const fetchLeads = useCallback(async (page = 1, filterParams = {}) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...Object.fromEntries(
                    Object.entries(filterParams).filter(([, value]) => value !== '')
                )
            });

            const response = await api.get(`/api/leads?${queryParams}`);
            setRowData(response.data.data);
            setPagination({
                currentPage: response.data.page,
                totalPages: response.data.totalPages,
                totalLeads: response.data.total
            });
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads(pagination.currentPage, filters);
    }, [pagination.currentPage, filters, fetchLeads]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            company: '',
            status: '',
            source: '',
            city: '',
            state: '',
            score_min: '',
            score_max: '',
            is_qualified: '',
            created_from: '',
            created_to: '',
            last_activity_from: '',
            last_activity_to: ''
        });
        
        if (gridRef.current?.api) {
            gridRef.current.api.setFilterModel(null);
        }
    };

    const handleOpenModal = (lead = null) => {
        setCurrentLead(lead);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentLead(null);
    };

    const handleSaveSuccess = () => {
        handleCloseModal();
        fetchLeads(pagination.currentPage, filters);
    };

    const handleEdit = (lead) => {
        console.log('Edit lead:', lead);
        // TODO: Implement edit functionality
    };

    const handleDelete = async (leadId) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await api.delete(`/api/leads/${leadId}`);
                fetchLeads(pagination.currentPage, filters);
            } catch (error) {
                console.error('Error deleting lead:', error);
            }
        }
    };

    const handleCreateLead = () => {
        handleOpenModal();
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <h1>Leads Dashboard</h1>
                    <div className="user-section">
                        <span className="welcome-text">Welcome, {user?.name}</span>
                        <button onClick={logout} className="button logout-btn">
                            <FaSignOutAlt />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-main">
                <div className="card filters-container">
                    <h2>Filter Leads</h2>
                    <div className="filters-grid">
                        <input
                            type="text"
                            placeholder="Company"
                            value={filters.company}
                            onChange={(e) => handleFilterChange('company', e.target.value)}
                        />
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="lost">Lost</option>
                            <option value="won">Won</option>
                        </select>
                        <select
                            value={filters.source}
                            onChange={(e) => handleFilterChange('source', e.target.value)}
                        >
                            <option value="">All Sources</option>
                            <option value="website">Website</option>
                            <option value="facebook_ads">Facebook Ads</option>
                            <option value="google_ads">Google Ads</option>
                            <option value="referral">Referral</option>
                            <option value="events">Events</option>
                            <option value="other">Other</option>
                        </select>
                        <input
                            type="text"
                            placeholder="City"
                            value={filters.city}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="State"
                            value={filters.state}
                            onChange={(e) => handleFilterChange('state', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Min Score"
                            value={filters.score_min}
                            onChange={(e) => handleFilterChange('score_min', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Max Score"
                            value={filters.score_max}
                            onChange={(e) => handleFilterChange('score_max', e.target.value)}
                        />
                        <select
                            value={filters.is_qualified}
                            onChange={(e) => handleFilterChange('is_qualified', e.target.value)}
                        >
                            <option value="">All Qualification</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                        <div>
                            <label>Created From</label>
                            <input
                                type="date"
                                value={filters.created_from}
                                onChange={(e) => handleFilterChange('created_from', e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Created To</label>
                            <input
                                type="date"
                                value={filters.created_to}
                                onChange={(e) => handleFilterChange('created_to', e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Last Activity From</label>
                            <input
                                type="date"
                                value={filters.last_activity_from}
                                onChange={(e) => handleFilterChange('last_activity_from', e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Last Activity To</label>
                            <input
                                type="date"
                                value={filters.last_activity_to}
                                onChange={(e) => handleFilterChange('last_activity_to', e.target.value)}
                            />
                        </div>
                    </div>
                    <button onClick={clearFilters} className="button clear-btn">
                        <FaTimes />
                        Clear Filters
                    </button>
                </div>

                <div className="actions-container">
                    <h2>Total Leads: {pagination.totalLeads.toLocaleString()}</h2>
                    <button onClick={handleCreateLead} className="button primary">
                        <FaPlus />
                        Create New Lead
                    </button>
                </div>

                <div className="card grid-container">
                    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            pagination={false}
                            loading={loading}
                            domLayout="normal"
                            suppressMovableColumns={true}
                            suppressMenuHide={true}
                            theme="legacy"
                            suppressHorizontalScroll={false}
                            suppressColumnVirtualisation={true}
                        />
                    </div>
                </div>

                <div className="card pagination-container">
                    <div className="page-info">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <div className="pagination-controls">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                            disabled={pagination.currentPage === 1}
                            className="button"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="button"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <LeadFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                leadData={currentLead}
                onSave={handleSaveSuccess}
            />
        </div>
    );
};

export default LeadsDashboard;
