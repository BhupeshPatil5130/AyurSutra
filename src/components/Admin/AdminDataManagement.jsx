import React, { useState, useEffect } from 'react';
import DataTable from '../shared/DataTable';
import DataManagementForm from '../shared/DataManagementForm';
import { 
  userManager, 
  practitionerManager, 
  patientManager,
  appointmentManager,
  invoiceManager,
  reviewManager,
  notificationManager,
  validators 
} from '../../utils/dataManager';

const AdminDataManagement = ({ adminId }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [data, setData] = useState({
    users: [],
    practitioners: [],
    patients: [],
    appointments: [],
    invoices: [],
    reviews: [],
    notifications: [],
    analytics: [],
    settings: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, adminId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const manager = getManagerForTab(activeTab);
      const result = await manager.getAll();
      if (result.success) {
        setData(prev => ({ ...prev, [activeTab]: result.data }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getManagerForTab = (tab) => {
    switch (tab) {
      case 'users': return userManager;
      case 'practitioners': return practitionerManager;
      case 'patients': return patientManager;
      case 'appointments': return appointmentManager;
      case 'invoices': return invoiceManager;
      case 'reviews': return reviewManager;
      case 'notifications': return notificationManager;
      default: return userManager;
    }
  };

  const getFieldsForTab = (tab) => {
    switch (tab) {
      case 'users':
        return [
          { name: 'name', label: 'नाम / Name', type: 'text', required: true },
          { name: 'email', label: 'ईमेल / Email', type: 'email', required: true },
          { name: 'phone', label: 'फोन / Phone', type: 'tel', required: true },
          { name: 'role', label: 'भूमिका / Role', type: 'select', required: true, options: [
            { value: 'patient', label: 'रोगी / Patient' },
            { value: 'practitioner', label: 'चिकित्सक / Practitioner' },
            { value: 'admin', label: 'प्रशासक / Admin' }
          ]},
          { name: 'status', label: 'स्थिति / Status', type: 'select', required: true, options: [
            { value: 'active', label: 'सक्रिय / Active' },
            { value: 'inactive', label: 'निष्क्रिय / Inactive' },
            { value: 'suspended', label: 'निलंबित / Suspended' },
            { value: 'pending', label: 'लंबित / Pending' }
          ]},
          { name: 'registrationDate', label: 'पंजीकरण दिनांक / Registration Date', type: 'date' },
          { name: 'lastLogin', label: 'अंतिम लॉगिन / Last Login', type: 'datetime-local' },
          { name: 'address', label: 'पता / Address', type: 'textarea', fullWidth: true },
          { name: 'notes', label: 'टिप्पणी / Notes', type: 'textarea', fullWidth: true }
        ];

      case 'practitioners':
        return [
          { name: 'name', label: 'चिकित्सक नाम / Practitioner Name', type: 'text', required: true },
          { name: 'email', label: 'ईमेल / Email', type: 'email', required: true },
          { name: 'phone', label: 'फोन / Phone', type: 'tel', required: true },
          { name: 'specialization', label: 'विशेषज्ञता / Specialization', type: 'select', required: true, options: [
            { value: 'general_ayurveda', label: 'सामान्य आयुर्वेद / General Ayurveda' },
            { value: 'panchakarma', label: 'पंचकर्म / Panchakarma' },
            { value: 'kayachikitsa', label: 'कायचिकित्सा / Kayachikitsa' },
            { value: 'shalya_tantra', label: 'शल्य तंत्र / Shalya Tantra' },
            { value: 'shalakya_tantra', label: 'शालाक्य तंत्र / Shalakya Tantra' },
            { value: 'prasuti_tantra', label: 'प्रसूति तंत्र / Prasuti Tantra' },
            { value: 'kaumarbhritya', label: 'कौमारभृत्य / Kaumarbhritya' },
            { value: 'agada_tantra', label: 'अगद तंत्र / Agada Tantra' }
          ]},
          { name: 'qualification', label: 'योग्यता / Qualification', type: 'text', required: true },
          { name: 'experience', label: 'अनुभव (वर्ष) / Experience (years)', type: 'number', required: true, min: 0 },
          { name: 'licenseNumber', label: 'लाइसेंस नंबर / License Number', type: 'text', required: true },
          { name: 'consultationFee', label: 'परामर्श शुल्क / Consultation Fee (₹)', type: 'number', required: true, min: 0 },
          { name: 'languages', label: 'भाषाएं / Languages', type: 'text', fullWidth: true },
          { name: 'clinicAddress', label: 'क्लिनिक पता / Clinic Address', type: 'textarea', fullWidth: true },
          { name: 'verificationStatus', label: 'सत्यापन स्थिति / Verification Status', type: 'select', options: [
            { value: 'pending', label: 'लंबित / Pending' },
            { value: 'verified', label: 'सत्यापित / Verified' },
            { value: 'rejected', label: 'अस्वीकृत / Rejected' }
          ]}
        ];

      case 'patients':
        return [
          { name: 'name', label: 'रोगी नाम / Patient Name', type: 'text', required: true },
          { name: 'email', label: 'ईमेल / Email', type: 'email', required: true },
          { name: 'phone', label: 'फोन / Phone', type: 'tel', required: true },
          { name: 'age', label: 'आयु / Age', type: 'number', required: true, min: 1, max: 120 },
          { name: 'gender', label: 'लिंग / Gender', type: 'select', required: true, options: [
            { value: 'male', label: 'पुरुष / Male' },
            { value: 'female', label: 'महिला / Female' },
            { value: 'other', label: 'अन्य / Other' }
          ]},
          { name: 'constitution', label: 'प्रकृति / Constitution', type: 'select', options: [
            { value: 'vata', label: 'वात प्रकृति / Vata' },
            { value: 'pitta', label: 'पित्त प्रकृति / Pitta' },
            { value: 'kapha', label: 'कफ प्रकृति / Kapha' },
            { value: 'vata-pitta', label: 'वात-पित्त / Vata-Pitta' },
            { value: 'pitta-kapha', label: 'पित्त-कफ / Pitta-Kapha' },
            { value: 'vata-kapha', label: 'वात-कफ / Vata-Kapha' }
          ]},
          { name: 'emergencyContact', label: 'आपातकालीन संपर्क / Emergency Contact', type: 'tel' },
          { name: 'address', label: 'पता / Address', type: 'textarea', fullWidth: true },
          { name: 'medicalHistory', label: 'चिकित्सा इतिहास / Medical History', type: 'textarea', fullWidth: true }
        ];

      case 'appointments':
        return [
          { name: 'patientId', label: 'रोगी / Patient', type: 'select', required: true, options: [] },
          { name: 'practitionerId', label: 'चिकित्सक / Practitioner', type: 'select', required: true, options: [] },
          { name: 'appointmentDate', label: 'नियुक्ति दिनांक / Appointment Date', type: 'datetime-local', required: true },
          { name: 'type', label: 'प्रकार / Type', type: 'select', required: true, options: [
            { value: 'consultation', label: 'परामर्श / Consultation' },
            { value: 'followup', label: 'फॉलो-अप / Follow-up' },
            { value: 'treatment', label: 'उपचार / Treatment' },
            { value: 'emergency', label: 'आपातकाल / Emergency' }
          ]},
          { name: 'status', label: 'स्थिति / Status', type: 'select', required: true, options: [
            { value: 'scheduled', label: 'निर्धारित / Scheduled' },
            { value: 'confirmed', label: 'पुष्ट / Confirmed' },
            { value: 'completed', label: 'पूर्ण / Completed' },
            { value: 'cancelled', label: 'रद्द / Cancelled' },
            { value: 'no_show', label: 'अनुपस्थित / No Show' }
          ]},
          { name: 'fees', label: 'शुल्क / Fees (₹)', type: 'number', min: 0 },
          { name: 'notes', label: 'टिप्पणी / Notes', type: 'textarea', fullWidth: true }
        ];

      case 'invoices':
        return [
          { name: 'patientId', label: 'रोगी / Patient', type: 'select', required: true, options: [] },
          { name: 'practitionerId', label: 'चिकित्सक / Practitioner', type: 'select', required: true, options: [] },
          { name: 'appointmentId', label: 'नियुक्ति / Appointment', type: 'select', options: [] },
          { name: 'invoiceNumber', label: 'चालान संख्या / Invoice Number', type: 'text', required: true },
          { name: 'amount', label: 'राशि / Amount (₹)', type: 'number', required: true, min: 0 },
          { name: 'tax', label: 'कर / Tax (₹)', type: 'number', min: 0 },
          { name: 'discount', label: 'छूट / Discount (₹)', type: 'number', min: 0 },
          { name: 'paymentStatus', label: 'भुगतान स्थिति / Payment Status', type: 'select', required: true, options: [
            { value: 'pending', label: 'लंबित / Pending' },
            { value: 'paid', label: 'भुगतान / Paid' },
            { value: 'partial', label: 'आंशिक / Partial' },
            { value: 'overdue', label: 'अतिदेय / Overdue' },
            { value: 'cancelled', label: 'रद्द / Cancelled' }
          ]},
          { name: 'paymentMethod', label: 'भुगतान विधि / Payment Method', type: 'select', options: [
            { value: 'cash', label: 'नकद / Cash' },
            { value: 'card', label: 'कार्ड / Card' },
            { value: 'upi', label: 'UPI' },
            { value: 'bank_transfer', label: 'बैंक ट्रांसफर / Bank Transfer' }
          ]},
          { name: 'dueDate', label: 'देय दिनांक / Due Date', type: 'date' },
          { name: 'description', label: 'विवरण / Description', type: 'textarea', fullWidth: true }
        ];

      case 'notifications':
        return [
          { name: 'title', label: 'शीर्षक / Title', type: 'text', required: true },
          { name: 'message', label: 'संदेश / Message', type: 'textarea', required: true, fullWidth: true },
          { name: 'type', label: 'प्रकार / Type', type: 'select', required: true, options: [
            { value: 'info', label: 'सूचना / Info' },
            { value: 'warning', label: 'चेतावनी / Warning' },
            { value: 'success', label: 'सफलता / Success' },
            { value: 'error', label: 'त्रुटि / Error' }
          ]},
          { name: 'targetAudience', label: 'लक्षित दर्शक / Target Audience', type: 'select', required: true, options: [
            { value: 'all', label: 'सभी / All' },
            { value: 'patients', label: 'रोगी / Patients' },
            { value: 'practitioners', label: 'चिकित्सक / Practitioners' },
            { value: 'admins', label: 'प्रशासक / Admins' }
          ]},
          { name: 'priority', label: 'प्राथमिकता / Priority', type: 'select', options: [
            { value: 'low', label: 'कम / Low' },
            { value: 'medium', label: 'मध्यम / Medium' },
            { value: 'high', label: 'उच्च / High' },
            { value: 'urgent', label: 'तत्काल / Urgent' }
          ]},
          { name: 'scheduledDate', label: 'निर्धारित दिनांक / Scheduled Date', type: 'datetime-local' },
          { name: 'expiryDate', label: 'समाप्ति दिनांक / Expiry Date', type: 'datetime-local' }
        ];

      default:
        return [];
    }
  };

  const getValidationRules = (tab) => {
    switch (tab) {
      case 'users':
        return {
          name: [validators.required, (value) => validators.minLength(value, 2)],
          email: [validators.required, validators.email],
          phone: [validators.required, validators.indianPhone],
          role: [validators.required],
          status: [validators.required]
        };
      case 'practitioners':
        return {
          name: [validators.required, (value) => validators.minLength(value, 2)],
          email: [validators.required, validators.email],
          phone: [validators.required, validators.indianPhone],
          specialization: [validators.required],
          qualification: [validators.required],
          experience: [validators.required, (value) => value >= 0],
          licenseNumber: [validators.required],
          consultationFee: [validators.required, (value) => value >= 0]
        };
      case 'patients':
        return {
          name: [validators.required, (value) => validators.minLength(value, 2)],
          email: [validators.required, validators.email],
          phone: [validators.required, validators.indianPhone],
          age: [validators.required, (value) => value > 0 && value <= 120],
          gender: [validators.required]
        };
      case 'appointments':
        return {
          patientId: [validators.required],
          practitionerId: [validators.required],
          appointmentDate: [validators.required],
          type: [validators.required],
          status: [validators.required]
        };
      case 'invoices':
        return {
          patientId: [validators.required],
          practitionerId: [validators.required],
          invoiceNumber: [validators.required],
          amount: [validators.required, (value) => value >= 0],
          paymentStatus: [validators.required]
        };
      case 'notifications':
        return {
          title: [validators.required],
          message: [validators.required],
          type: [validators.required],
          targetAudience: [validators.required]
        };
      default:
        return {};
    }
  };

  const getColumnsForTab = (tab) => {
    switch (tab) {
      case 'users':
        return [
          { key: 'name', label: 'नाम / Name', sortable: true },
          { key: 'email', label: 'ईमेल / Email', sortable: true },
          { key: 'role', label: 'भूमिका / Role', sortable: true },
          { key: 'status', label: 'स्थिति / Status', sortable: true },
          { key: 'registrationDate', label: 'पंजीकरण / Registration', type: 'date', sortable: true },
          { key: 'lastLogin', label: 'अंतिम लॉगिन / Last Login', type: 'date', sortable: true }
        ];
      case 'practitioners':
        return [
          { key: 'name', label: 'नाम / Name', sortable: true },
          { key: 'specialization', label: 'विशेषज्ञता / Specialization', sortable: true },
          { key: 'experience', label: 'अनुभव / Experience', render: (value) => `${value} वर्ष / years` },
          { key: 'consultationFee', label: 'शुल्क / Fee', type: 'currency', sortable: true },
          { key: 'verificationStatus', label: 'सत्यापन / Verification', sortable: true },
          { key: 'phone', label: 'फोन / Phone' }
        ];
      case 'patients':
        return [
          { key: 'name', label: 'नाम / Name', sortable: true },
          { key: 'age', label: 'आयु / Age', sortable: true },
          { key: 'gender', label: 'लिंग / Gender', sortable: true },
          { key: 'constitution', label: 'प्रकृति / Constitution', sortable: true },
          { key: 'phone', label: 'फोन / Phone' },
          { key: 'registrationDate', label: 'पंजीकरण / Registration', type: 'date', sortable: true }
        ];
      case 'appointments':
        return [
          { key: 'appointmentDate', label: 'दिनांक / Date', type: 'date', sortable: true },
          { key: 'patientName', label: 'रोगी / Patient', sortable: true },
          { key: 'practitionerName', label: 'चिकित्सक / Practitioner', sortable: true },
          { key: 'type', label: 'प्रकार / Type', sortable: true },
          { key: 'status', label: 'स्थिति / Status', sortable: true },
          { key: 'fees', label: 'शुल्क / Fees', type: 'currency', sortable: true }
        ];
      case 'invoices':
        return [
          { key: 'invoiceNumber', label: 'चालान / Invoice', sortable: true },
          { key: 'patientName', label: 'रोगी / Patient', sortable: true },
          { key: 'amount', label: 'राशि / Amount', type: 'currency', sortable: true },
          { key: 'paymentStatus', label: 'भुगतान / Payment', sortable: true },
          { key: 'dueDate', label: 'देय दिनांक / Due Date', type: 'date', sortable: true },
          { key: 'createdAt', label: 'निर्मित / Created', type: 'date', sortable: true }
        ];
      case 'notifications':
        return [
          { key: 'title', label: 'शीर्षक / Title', sortable: true },
          { key: 'type', label: 'प्रकार / Type', sortable: true },
          { key: 'targetAudience', label: 'दर्शक / Audience', sortable: true },
          { key: 'priority', label: 'प्राथमिकता / Priority', sortable: true },
          { key: 'scheduledDate', label: 'निर्धारित / Scheduled', type: 'date', sortable: true },
          { key: 'status', label: 'स्थिति / Status', sortable: true }
        ];
      default:
        return [];
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('क्या आप वाकई इसे हटाना चाहते हैं? / Are you sure you want to delete this?')) {
      const manager = getManagerForTab(activeTab);
      const result = await manager.delete(item.id);
      if (result.success) {
        loadData();
      }
    }
  };

  const handleSubmit = async (formData) => {
    const manager = getManagerForTab(activeTab);
    
    let result;
    if (editingItem) {
      result = await manager.update(editingItem.id, formData);
    } else {
      result = await manager.create(formData);
    }
    
    if (result.success) {
      setShowForm(false);
      setEditingItem(null);
      loadData();
    }
  };

  const tabs = [
    { key: 'users', label: 'उपयोगकर्ता / Users', icon: '👤' },
    { key: 'practitioners', label: 'चिकित्सक / Practitioners', icon: '👨‍⚕️' },
    { key: 'patients', label: 'रोगी / Patients', icon: '🏥' },
    { key: 'appointments', label: 'नियुक्तियां / Appointments', icon: '📅' },
    { key: 'invoices', label: 'चालान / Invoices', icon: '💰' },
    { key: 'notifications', label: 'सूचनाएं / Notifications', icon: '🔔' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">प्रशासनिक डेटा प्रबंधन / Administrative Data Management</h1>
        <p className="mt-2 opacity-90">सिस्टम डेटा का संपूर्ण प्रबंधन / Complete system data management</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {showForm ? (
        <DataManagementForm
          title={`${editingItem ? 'संपादित करें' : 'नया जोड़ें'} ${tabs.find(t => t.key === activeTab)?.label}`}
          fields={getFieldsForTab(activeTab)}
          initialData={editingItem || {}}
          validationRules={getValidationRules(activeTab)}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      ) : (
        <DataTable
          title={tabs.find(t => t.key === activeTab)?.label}
          data={data[activeTab]}
          columns={getColumnsForTab(activeTab)}
          loading={loading}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable={true}
          exportable={true}
          pagination={true}
        />
      )}
    </div>
  );
};

export default AdminDataManagement;
