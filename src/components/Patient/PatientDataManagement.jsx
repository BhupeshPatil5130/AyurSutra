import React, { useState, useEffect } from 'react';
import DataTable from '../shared/DataTable';
import DataManagementForm from '../shared/DataManagementForm';
import { 
  appointmentManager, 
  medicalRecordManager, 
  therapyPlanManager,
  validators,
  validateForm 
} from '../../utils/dataManager';

const PatientDataManagement = ({ patientId }) => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [data, setData] = useState({
    appointments: [],
    medicalRecords: [],
    therapyPlans: [],
    healthGoals: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, patientId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getManagerForTab(activeTab).getAll({ patientId });
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
      case 'appointments': return appointmentManager;
      case 'medicalRecords': return medicalRecordManager;
      case 'therapyPlans': return therapyPlanManager;
      default: return appointmentManager;
    }
  };

  const getFieldsForTab = (tab) => {
    switch (tab) {
      case 'appointments':
        return [
          { name: 'practitionerId', label: 'चिकित्सक / Practitioner', type: 'select', required: true, options: [] },
          { name: 'appointmentDate', label: 'नियुक्ति दिनांक / Appointment Date', type: 'datetime-local', required: true },
          { name: 'type', label: 'प्रकार / Type', type: 'select', required: true, options: [
            { value: 'consultation', label: 'परामर्श / Consultation' },
            { value: 'followup', label: 'फॉलो-अप / Follow-up' },
            { value: 'treatment', label: 'उपचार / Treatment' },
            { value: 'panchakarma', label: 'पंचकर्म / Panchakarma' }
          ]},
          { name: 'symptoms', label: 'लक्षण / Symptoms', type: 'textarea', fullWidth: true },
          { name: 'notes', label: 'टिप्पणी / Notes', type: 'textarea', fullWidth: true },
          { name: 'priority', label: 'प्राथमिकता / Priority', type: 'select', options: [
            { value: 'low', label: 'कम / Low' },
            { value: 'medium', label: 'मध्यम / Medium' },
            { value: 'high', label: 'उच्च / High' },
            { value: 'urgent', label: 'तत्काल / Urgent' }
          ]}
        ];

      case 'medicalRecords':
        return [
          { name: 'recordType', label: 'रिकॉर्ड प्रकार / Record Type', type: 'select', required: true, options: [
            { value: 'diagnosis', label: 'निदान / Diagnosis' },
            { value: 'prescription', label: 'नुस्खा / Prescription' },
            { value: 'test_result', label: 'परीक्षण परिणाम / Test Result' },
            { value: 'treatment_plan', label: 'उपचार योजना / Treatment Plan' }
          ]},
          { name: 'date', label: 'दिनांक / Date', type: 'date', required: true },
          { name: 'practitionerId', label: 'चिकित्सक / Practitioner', type: 'select', required: true, options: [] },
          { name: 'diagnosis', label: 'निदान / Diagnosis', type: 'textarea', fullWidth: true },
          { name: 'prescription', label: 'दवाएं / Medicines', type: 'textarea', fullWidth: true, 
            helpText: 'आयुर्वेदिक दवाओं की सूची / List of Ayurvedic medicines' },
          { name: 'doshaImbalance', label: 'दोष असंतुलन / Dosha Imbalance', type: 'select', options: [
            { value: 'vata', label: 'वात / Vata' },
            { value: 'pitta', label: 'पित्त / Pitta' },
            { value: 'kapha', label: 'कफ / Kapha' },
            { value: 'vata-pitta', label: 'वात-पित्त / Vata-Pitta' },
            { value: 'pitta-kapha', label: 'पित्त-कफ / Pitta-Kapha' },
            { value: 'vata-kapha', label: 'वात-कफ / Vata-Kapha' }
          ]},
          { name: 'lifestyle', label: 'जीवनशैली सुझाव / Lifestyle Suggestions', type: 'textarea', fullWidth: true }
        ];

      case 'therapyPlans':
        return [
          { name: 'planName', label: 'योजना नाम / Plan Name', type: 'text', required: true },
          { name: 'therapyType', label: 'चिकित्सा प्रकार / Therapy Type', type: 'select', required: true, options: [
            { value: 'panchakarma', label: 'पंचकर्म / Panchakarma' },
            { value: 'abhyanga', label: 'अभ्यंग / Abhyanga' },
            { value: 'shirodhara', label: 'शिरोधारा / Shirodhara' },
            { value: 'nasya', label: 'नस्य / Nasya' },
            { value: 'basti', label: 'बस्ति / Basti' },
            { value: 'udvartana', label: 'उद्वर्तन / Udvartana' }
          ]},
          { name: 'duration', label: 'अवधि (दिन) / Duration (days)', type: 'number', required: true, min: 1 },
          { name: 'startDate', label: 'प्रारंभ दिनांक / Start Date', type: 'date', required: true },
          { name: 'practitionerId', label: 'चिकित्सक / Practitioner', type: 'select', required: true, options: [] },
          { name: 'objectives', label: 'उद्देश्य / Objectives', type: 'textarea', fullWidth: true },
          { name: 'instructions', label: 'निर्देश / Instructions', type: 'textarea', fullWidth: true },
          { name: 'cost', label: 'लागत / Cost (₹)', type: 'number', min: 0 }
        ];

      case 'healthGoals':
        return [
          { name: 'goalTitle', label: 'लक्ष्य शीर्षक / Goal Title', type: 'text', required: true },
          { name: 'category', label: 'श्रेणी / Category', type: 'select', required: true, options: [
            { value: 'weight', label: 'वजन प्रबंधन / Weight Management' },
            { value: 'stress', label: 'तनाव प्रबंधन / Stress Management' },
            { value: 'digestion', label: 'पाचन / Digestion' },
            { value: 'sleep', label: 'नींद / Sleep' },
            { value: 'energy', label: 'ऊर्जा / Energy' },
            { value: 'immunity', label: 'प्रतिरक्षा / Immunity' }
          ]},
          { name: 'targetDate', label: 'लक्ष्य दिनांक / Target Date', type: 'date', required: true },
          { name: 'currentValue', label: 'वर्तमान मान / Current Value', type: 'text' },
          { name: 'targetValue', label: 'लक्ष्य मान / Target Value', type: 'text', required: true },
          { name: 'description', label: 'विवरण / Description', type: 'textarea', fullWidth: true },
          { name: 'priority', label: 'प्राथमिकता / Priority', type: 'select', options: [
            { value: 'low', label: 'कम / Low' },
            { value: 'medium', label: 'मध्यम / Medium' },
            { value: 'high', label: 'उच्च / High' }
          ]}
        ];

      default:
        return [];
    }
  };

  const getValidationRules = (tab) => {
    const commonRules = {
      required: [validators.required]
    };

    switch (tab) {
      case 'appointments':
        return {
          practitionerId: [validators.required],
          appointmentDate: [validators.required],
          type: [validators.required]
        };
      case 'medicalRecords':
        return {
          recordType: [validators.required],
          date: [validators.required],
          practitionerId: [validators.required]
        };
      case 'therapyPlans':
        return {
          planName: [validators.required],
          therapyType: [validators.required],
          duration: [validators.required, (value) => value > 0],
          startDate: [validators.required],
          practitionerId: [validators.required]
        };
      case 'healthGoals':
        return {
          goalTitle: [validators.required],
          category: [validators.required],
          targetDate: [validators.required],
          targetValue: [validators.required]
        };
      default:
        return {};
    }
  };

  const getColumnsForTab = (tab) => {
    switch (tab) {
      case 'appointments':
        return [
          { key: 'appointmentDate', label: 'दिनांक / Date', type: 'date', sortable: true },
          { key: 'practitionerName', label: 'चिकित्सक / Practitioner', sortable: true },
          { key: 'type', label: 'प्रकार / Type', sortable: true },
          { key: 'status', label: 'स्थिति / Status', sortable: true },
          { key: 'priority', label: 'प्राथमिकता / Priority', sortable: true }
        ];
      case 'medicalRecords':
        return [
          { key: 'date', label: 'दिनांक / Date', type: 'date', sortable: true },
          { key: 'recordType', label: 'प्रकार / Type', sortable: true },
          { key: 'practitionerName', label: 'चिकित्सक / Practitioner', sortable: true },
          { key: 'diagnosis', label: 'निदान / Diagnosis' },
          { key: 'doshaImbalance', label: 'दोष / Dosha' }
        ];
      case 'therapyPlans':
        return [
          { key: 'planName', label: 'योजना / Plan', sortable: true },
          { key: 'therapyType', label: 'चिकित्सा / Therapy', sortable: true },
          { key: 'startDate', label: 'प्रारंभ / Start', type: 'date', sortable: true },
          { key: 'duration', label: 'अवधि / Duration', sortable: true },
          { key: 'status', label: 'स्थिति / Status', sortable: true },
          { key: 'cost', label: 'लागत / Cost', type: 'currency', sortable: true }
        ];
      case 'healthGoals':
        return [
          { key: 'goalTitle', label: 'लक्ष्य / Goal', sortable: true },
          { key: 'category', label: 'श्रेणी / Category', sortable: true },
          { key: 'targetDate', label: 'लक्ष्य दिनांक / Target Date', type: 'date', sortable: true },
          { key: 'progress', label: 'प्रगति / Progress', render: (value) => `${value || 0}%` },
          { key: 'priority', label: 'प्राथमिकता / Priority', sortable: true }
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
    const dataWithPatient = { ...formData, patientId };
    
    let result;
    if (editingItem) {
      result = await manager.update(editingItem.id, dataWithPatient);
    } else {
      result = await manager.create(dataWithPatient);
    }
    
    if (result.success) {
      setShowForm(false);
      setEditingItem(null);
      loadData();
    }
  };

  const tabs = [
    { key: 'appointments', label: 'नियुक्तियां / Appointments', icon: '📅' },
    { key: 'medicalRecords', label: 'चिकित्सा रिकॉर्ड / Medical Records', icon: '📋' },
    { key: 'therapyPlans', label: 'चिकित्सा योजना / Therapy Plans', icon: '🌿' },
    { key: 'healthGoals', label: 'स्वास्थ्य लक्ष्य / Health Goals', icon: '🎯' }
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

export default PatientDataManagement;
