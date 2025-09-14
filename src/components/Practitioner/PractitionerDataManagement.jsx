import React, { useState, useEffect } from 'react';
import DataTable from '../shared/DataTable';
import DataManagementForm from '../shared/DataManagementForm';
import { 
  patientManager, 
  appointmentManager, 
  therapyPlanManager,
  medicalRecordManager,
  treatmentManager,
  validators 
} from '../../utils/dataManager';

const PractitionerDataManagement = ({ practitionerId }) => {
  const [activeTab, setActiveTab] = useState('patients');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [data, setData] = useState({
    patients: [],
    appointments: [],
    therapyPlans: [],
    treatments: [],
    schedules: [],
    earnings: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, practitionerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const manager = getManagerForTab(activeTab);
      const result = await manager.getAll({ practitionerId });
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
      case 'patients': return patientManager;
      case 'appointments': return appointmentManager;
      case 'therapyPlans': return therapyPlanManager;
      case 'treatments': return treatmentManager;
      case 'schedules': return appointmentManager;
      default: return patientManager;
    }
  };

  const getFieldsForTab = (tab) => {
    switch (tab) {
      case 'patients':
        return [
          { name: 'name', label: 'रोगी का नाम / Patient Name', type: 'text', required: true },
          { name: 'email', label: 'ईमेल / Email', type: 'email', required: true },
          { name: 'phone', label: 'फोन / Phone', type: 'tel', required: true },
          { name: 'age', label: 'आयु / Age', type: 'number', required: true, min: 1, max: 120 },
          { name: 'gender', label: 'लिंग / Gender', type: 'select', required: true, options: [
            { value: 'male', label: 'पुरुष / Male' },
            { value: 'female', label: 'महिला / Female' },
            { value: 'other', label: 'अन्य / Other' }
          ]},
          { name: 'constitution', label: 'प्रकृति / Constitution', type: 'select', required: true, options: [
            { value: 'vata', label: 'वात प्रकृति / Vata' },
            { value: 'pitta', label: 'पित्त प्रकृति / Pitta' },
            { value: 'kapha', label: 'कफ प्रकृति / Kapha' },
            { value: 'vata-pitta', label: 'वात-पित्त / Vata-Pitta' },
            { value: 'pitta-kapha', label: 'पित्त-कफ / Pitta-Kapha' },
            { value: 'vata-kapha', label: 'वात-कफ / Vata-Kapha' },
            { value: 'tridosha', label: 'त्रिदोष / Tridosha' }
          ]},
          { name: 'address', label: 'पता / Address', type: 'textarea', fullWidth: true },
          { name: 'medicalHistory', label: 'चिकित्सा इतिहास / Medical History', type: 'textarea', fullWidth: true },
          { name: 'allergies', label: 'एलर्जी / Allergies', type: 'textarea', fullWidth: true }
        ];

      case 'appointments':
        return [
          { name: 'patientId', label: 'रोगी / Patient', type: 'select', required: true, options: [] },
          { name: 'appointmentDate', label: 'नियुक्ति दिनांक / Appointment Date', type: 'datetime-local', required: true },
          { name: 'duration', label: 'अवधि (मिनट) / Duration (minutes)', type: 'number', required: true, min: 15, step: 15 },
          { name: 'type', label: 'प्रकार / Type', type: 'select', required: true, options: [
            { value: 'consultation', label: 'परामर्श / Consultation' },
            { value: 'followup', label: 'फॉलो-अप / Follow-up' },
            { value: 'treatment', label: 'उपचार / Treatment' },
            { value: 'panchakarma', label: 'पंचकर्म / Panchakarma' },
            { value: 'abhyanga', label: 'अभ्यंग / Abhyanga' },
            { value: 'shirodhara', label: 'शिरोधारा / Shirodhara' }
          ]},
          { name: 'fees', label: 'शुल्क / Fees (₹)', type: 'number', required: true, min: 0 },
          { name: 'notes', label: 'टिप्पणी / Notes', type: 'textarea', fullWidth: true },
          { name: 'status', label: 'स्थिति / Status', type: 'select', options: [
            { value: 'scheduled', label: 'निर्धारित / Scheduled' },
            { value: 'confirmed', label: 'पुष्ट / Confirmed' },
            { value: 'completed', label: 'पूर्ण / Completed' },
            { value: 'cancelled', label: 'रद्द / Cancelled' }
          ]}
        ];

      case 'therapyPlans':
        return [
          { name: 'patientId', label: 'रोगी / Patient', type: 'select', required: true, options: [] },
          { name: 'planName', label: 'योजना नाम / Plan Name', type: 'text', required: true },
          { name: 'therapyType', label: 'चिकित्सा प्रकार / Therapy Type', type: 'select', required: true, options: [
            { value: 'panchakarma', label: 'पंचकर्म / Panchakarma' },
            { value: 'abhyanga', label: 'अभ्यंग / Abhyanga' },
            { value: 'shirodhara', label: 'शिरोधारा / Shirodhara' },
            { value: 'nasya', label: 'नस्य / Nasya' },
            { value: 'basti', label: 'बस्ति / Basti' },
            { value: 'udvartana', label: 'उद्वर्तन / Udvartana' },
            { value: 'karna_purana', label: 'कर्णपूरण / Karna Purana' },
            { value: 'akshi_tarpana', label: 'अक्षितर्पण / Akshi Tarpana' }
          ]},
          { name: 'duration', label: 'अवधि (दिन) / Duration (days)', type: 'number', required: true, min: 1 },
          { name: 'sessionsPerWeek', label: 'सप्ताह में सत्र / Sessions per week', type: 'number', required: true, min: 1, max: 7 },
          { name: 'startDate', label: 'प्रारंभ दिनांक / Start Date', type: 'date', required: true },
          { name: 'objectives', label: 'उद्देश्य / Objectives', type: 'textarea', fullWidth: true },
          { name: 'medicines', label: 'दवाएं / Medicines', type: 'textarea', fullWidth: true },
          { name: 'dietPlan', label: 'आहार योजना / Diet Plan', type: 'textarea', fullWidth: true },
          { name: 'lifestyle', label: 'जीवनशैली / Lifestyle', type: 'textarea', fullWidth: true },
          { name: 'totalCost', label: 'कुल लागत / Total Cost (₹)', type: 'number', min: 0 }
        ];

      case 'treatments':
        return [
          { name: 'patientId', label: 'रोगी / Patient', type: 'select', required: true, options: [] },
          { name: 'treatmentName', label: 'उपचार नाम / Treatment Name', type: 'text', required: true },
          { name: 'category', label: 'श्रेणी / Category', type: 'select', required: true, options: [
            { value: 'shodhana', label: 'शोधन चिकित्सा / Shodhana' },
            { value: 'shamana', label: 'शमन चिकित्सा / Shamana' },
            { value: 'rasayana', label: 'रसायन चिकित्सा / Rasayana' },
            { value: 'satvavajaya', label: 'सत्त्वावजय चिकित्सा / Satvavajaya' }
          ]},
          { name: 'medicines', label: 'दवाएं / Medicines', type: 'textarea', required: true, fullWidth: true },
          { name: 'dosage', label: 'मात्रा / Dosage', type: 'textarea', fullWidth: true },
          { name: 'duration', label: 'अवधि / Duration', type: 'text', required: true },
          { name: 'instructions', label: 'निर्देश / Instructions', type: 'textarea', fullWidth: true },
          { name: 'precautions', label: 'सावधानियां / Precautions', type: 'textarea', fullWidth: true },
          { name: 'followUpDate', label: 'फॉलो-अप दिनांक / Follow-up Date', type: 'date' }
        ];

      case 'schedules':
        return [
          { name: 'date', label: 'दिनांक / Date', type: 'date', required: true },
          { name: 'startTime', label: 'प्रारंभ समय / Start Time', type: 'time', required: true },
          { name: 'endTime', label: 'समाप्ति समय / End Time', type: 'time', required: true },
          { name: 'slotDuration', label: 'स्लॉट अवधि (मिनट) / Slot Duration (minutes)', type: 'number', required: true, min: 15, step: 15 },
          { name: 'maxPatients', label: 'अधिकतम रोगी / Max Patients', type: 'number', required: true, min: 1 },
          { name: 'location', label: 'स्थान / Location', type: 'select', options: [
            { value: 'clinic', label: 'क्लिनिक / Clinic' },
            { value: 'hospital', label: 'अस्पताल / Hospital' },
            { value: 'home_visit', label: 'घर का दौरा / Home Visit' },
            { value: 'online', label: 'ऑनलाइन / Online' }
          ]},
          { name: 'notes', label: 'टिप्पणी / Notes', type: 'textarea', fullWidth: true }
        ];

      default:
        return [];
    }
  };

  const getValidationRules = (tab) => {
    switch (tab) {
      case 'patients':
        return {
          name: [validators.required, (value) => validators.minLength(value, 2)],
          email: [validators.required, validators.email],
          phone: [validators.required, validators.indianPhone],
          age: [validators.required, (value) => value > 0 && value <= 120],
          gender: [validators.required],
          constitution: [validators.required, validators.doshaType]
        };
      case 'appointments':
        return {
          patientId: [validators.required],
          appointmentDate: [validators.required],
          duration: [validators.required, (value) => value >= 15],
          type: [validators.required],
          fees: [validators.required, (value) => value >= 0]
        };
      case 'therapyPlans':
        return {
          patientId: [validators.required],
          planName: [validators.required],
          therapyType: [validators.required],
          duration: [validators.required, (value) => value > 0],
          sessionsPerWeek: [validators.required, (value) => value >= 1 && value <= 7],
          startDate: [validators.required]
        };
      case 'treatments':
        return {
          patientId: [validators.required],
          treatmentName: [validators.required],
          category: [validators.required],
          medicines: [validators.required],
          duration: [validators.required]
        };
      case 'schedules':
        return {
          date: [validators.required],
          startTime: [validators.required],
          endTime: [validators.required],
          slotDuration: [validators.required, (value) => value >= 15],
          maxPatients: [validators.required, (value) => value >= 1]
        };
      default:
        return {};
    }
  };

  const getColumnsForTab = (tab) => {
    switch (tab) {
      case 'patients':
        return [
          { key: 'name', label: 'नाम / Name', sortable: true },
          { key: 'age', label: 'आयु / Age', sortable: true },
          { key: 'gender', label: 'लिंग / Gender', sortable: true },
          { key: 'constitution', label: 'प्रकृति / Constitution', sortable: true },
          { key: 'phone', label: 'फोन / Phone' },
          { key: 'lastVisit', label: 'अंतिम भेंट / Last Visit', type: 'date', sortable: true }
        ];
      case 'appointments':
        return [
          { key: 'appointmentDate', label: 'दिनांक / Date', type: 'date', sortable: true },
          { key: 'patientName', label: 'रोगी / Patient', sortable: true },
          { key: 'type', label: 'प्रकार / Type', sortable: true },
          { key: 'duration', label: 'अवधि / Duration', render: (value) => `${value} मिनट / min` },
          { key: 'fees', label: 'शुल्क / Fees', type: 'currency', sortable: true },
          { key: 'status', label: 'स्थिति / Status', sortable: true }
        ];
      case 'therapyPlans':
        return [
          { key: 'planName', label: 'योजना / Plan', sortable: true },
          { key: 'patientName', label: 'रोगी / Patient', sortable: true },
          { key: 'therapyType', label: 'चिकित्सा / Therapy', sortable: true },
          { key: 'startDate', label: 'प्रारंभ / Start', type: 'date', sortable: true },
          { key: 'duration', label: 'अवधि / Duration', render: (value) => `${value} दिन / days` },
          { key: 'totalCost', label: 'लागत / Cost', type: 'currency', sortable: true },
          { key: 'status', label: 'स्थिति / Status', sortable: true }
        ];
      case 'treatments':
        return [
          { key: 'treatmentName', label: 'उपचार / Treatment', sortable: true },
          { key: 'patientName', label: 'रोगी / Patient', sortable: true },
          { key: 'category', label: 'श्रेणी / Category', sortable: true },
          { key: 'duration', label: 'अवधि / Duration', sortable: true },
          { key: 'followUpDate', label: 'फॉलो-अप / Follow-up', type: 'date', sortable: true },
          { key: 'status', label: 'स्थिति / Status', sortable: true }
        ];
      case 'schedules':
        return [
          { key: 'date', label: 'दिनांक / Date', type: 'date', sortable: true },
          { key: 'startTime', label: 'प्रारंभ / Start', sortable: true },
          { key: 'endTime', label: 'समाप्ति / End', sortable: true },
          { key: 'slotDuration', label: 'स्लॉट / Slot', render: (value) => `${value} मिनट / min` },
          { key: 'maxPatients', label: 'अधिकतम / Max Patients', sortable: true },
          { key: 'bookedSlots', label: 'बुक्ड / Booked', sortable: true },
          { key: 'location', label: 'स्थान / Location', sortable: true }
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
    const dataWithPractitioner = { ...formData, practitionerId };
    
    let result;
    if (editingItem) {
      result = await manager.update(editingItem.id, dataWithPractitioner);
    } else {
      result = await manager.create(dataWithPractitioner);
    }
    
    if (result.success) {
      setShowForm(false);
      setEditingItem(null);
      loadData();
    }
  };

  const tabs = [
    { key: 'patients', label: 'रोगी / Patients', icon: '👥' },
    { key: 'appointments', label: 'नियुक्तियां / Appointments', icon: '📅' },
    { key: 'therapyPlans', label: 'चिकित्सा योजना / Therapy Plans', icon: '🌿' },
    { key: 'treatments', label: 'उपचार / Treatments', icon: '💊' },
    { key: 'schedules', label: 'समय सारणी / Schedules', icon: '⏰' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
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

export default PractitionerDataManagement;
