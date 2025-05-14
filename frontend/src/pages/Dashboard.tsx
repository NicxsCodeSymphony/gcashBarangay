// Dashboard.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Calendar, Clock, FileText, Users, UserCheck, Bell, Plus, X, Upload, Check
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Image } from 'lucide-react';
// Types
interface Official {
  official_id: string;
  position: string;
  resident_id: string;
  start_term: string;
  end_term: string;
  status: string;
  first_name: string;
  middle_name: string;
  last_name: string;
}

interface Resident {
  residentId: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  age: string;
  gender: string;
  civil_status: string;
  occupation: string;
  barangay: string;
  municipality: string;
  province: string;
  contact_number: string;
  email: string;
  birthdate: string;
  voter_status: string;
  status: string;
  yearsResidency: string | number;
}

interface Document {
  documentId: string;
  documentType: string;
  first_name: string;
  last_name: string;
  purpose: string;
  status: string;
  timestamp: string;
  paymentMethod: string;
  requester_name?: string;
  requester_email?: string;
  approval_date?: string;
}

interface Announcement {
  id: string;
  admin_id: string;
  title: string;
  content: string;
  image?: string;
  created_at: string;
}

// Main Dashboard Component
export default function Dashboard() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [residents, setResidents] = useState<Record<string, Resident>>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<{
    title: string;
    content: string;
    image?: File | null;
  }>({
    title: '',
    content: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Example announcements data (would come from API)
  const sampleAnnouncements: Announcement[] = [
    {
      id: '1',
      admin_id: '-OMjgViXkP04Onq8eb6z',
      title: 'Barangay Cleanup Drive',
      content: 'Join us for the monthly barangay cleanup this Saturday from 7AM to 10AM. Please bring gloves and wear appropriate clothing.',
      image: 'https://drive.google.com/uc?id=sample1',
      created_at: '2025-05-01T08:00:00.000Z'
    },
    {
      id: '2',
      admin_id: '-OMjgViXkP04Onq8eb6z',
      title: 'COVID-19 Vaccination Schedule',
      content: 'Free COVID-19 booster shots available next week from Monday to Wednesday, 8AM to 4PM at the Barangay Health Center.',
      created_at: '2025-05-05T10:30:00.000Z'
    },
    {
      id: '3',
      admin_id: '-OMjgViXkP04Onq8eb6z',
      title: 'Free Skills Training Program',
      content: 'Register now for free skills training programs for residents aged 18-30. Limited slots available.',
      image: 'https://drive.google.com/uc?id=sample2',
      created_at: '2025-05-08T14:15:00.000Z'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real application, these would be API calls
        const officialsResponse = await fetch('https://barangayapi.vercel.app/officials');
        const officialsData = await officialsResponse.json();
        setOfficials(officialsData);

        const residentsResponse = await fetch('https://barangayapi.vercel.app/residents');
        const residentsData = await residentsResponse.json();
        setResidents(residentsData);

        const documentsResponse = await fetch('https://barangayapi.vercel.app/document');
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData);

        // For demo purposes, use sample announcements
        setAnnouncements(sampleAnnouncements);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for charts
  const residentsArray = Object.values(residents);

  // Gender distribution for pie chart
  const genderData = residentsArray.reduce((acc, resident) => {
    const gender = resident.gender?.trim();
    if (gender) {
      const normalizedGender = gender.toLowerCase().includes('male') 
        ? (gender.toLowerCase().includes('female') ? 'Female' : 'Male')
        : gender;
        
      const existingEntry = acc.find(item => item.name === normalizedGender);
      if (existingEntry) {
        existingEntry.value += 1;
      } else {
        acc.push({ name: normalizedGender, value: 1 });
      }
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Age distribution for bar chart
  const ageRanges = [
    { range: '0-18', count: 0 },
    { range: '19-30', count: 0 },
    { range: '31-45', count: 0 },
    { range: '46-60', count: 0 },
    { range: '61+', count: 0 }
  ];

  residentsArray.forEach(resident => {
    const age = parseInt(resident.age);
    if (!isNaN(age)) {
      if (age <= 18) ageRanges[0].count++;
      else if (age <= 30) ageRanges[1].count++;
      else if (age <= 45) ageRanges[2].count++;
      else if (age <= 60) ageRanges[3].count++;
      else ageRanges[4].count++;
    }
  });

  // Document status data for pie chart
  const documentStatusData = documents.reduce((acc, doc) => {
    const status = doc.status;
    const existingEntry = acc.find(item => item.name === status);
    if (existingEntry) {
      existingEntry.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Monthly document requests for line chart
  const currentYear = new Date().getFullYear();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlyDocumentData = monthNames.map((month, index) => {
    const count = documents.filter(doc => {
      const docDate = new Date(doc.timestamp);
      return docDate.getMonth() === index && docDate.getFullYear() === currentYear;
    }).length;
    
    return {
      name: month,
      requests: count
    };
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewAnnouncement(prev => ({ ...prev, image: file }));
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would upload to your backend
    const newAnnouncementObj: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      admin_id: '-OMjgViXkP04Onq8eb6z', // Using the Barangay Captain's ID
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      image: imagePreview || undefined,
      created_at: new Date().toISOString()
    };
    
    setAnnouncements(prev => [newAnnouncementObj, ...prev]);
    
    // Reset form
    setNewAnnouncement({
      title: '',
      content: '',
      image: null
    });
    setImagePreview(null);
    setIsAnnouncementModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-3xl font-bold">Barangay Dashboard</h1>
                <p className="mt-1 text-blue-100">Lamintak Sur, Medellin, Cebu</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                <div className="bg-blue-700 p-2 rounded-full">
                  <Calendar className="w-5 h-5" />
                </div>
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Residents</p>
                  <h3 className="text-3xl font-bold text-gray-800">{residentsArray.length}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="text-green-500 font-medium">+{Math.floor(residentsArray.length * 0.05)}</span> new this month
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Officials</p>
                  <h3 className="text-3xl font-bold text-gray-800">{officials.length}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="text-gray-700 font-medium">Active until 2025</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Document Requests</p>
                  <h3 className="text-3xl font-bold text-gray-800">{documents.length}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="text-purple-500 font-medium">{documents.filter(doc => doc.status === "Processing").length}</span> pending approvals
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Announcements</p>
                  <h3 className="text-3xl font-bold text-gray-800">{announcements.length}</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Bell className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="text-amber-500 font-medium">{announcements.filter(a => new Date(a.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</span> in the last week
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Gender Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Resident Gender Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} residents`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Resident Age Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} residents`, 'Count']} />
                    <Legend />
                    <Bar dataKey="count" name="Residents" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Document Status */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Document Request Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={documentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {documentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} documents`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Document Requests */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Document Requests ({currentYear})</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyDocumentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} requests`, 'Count']} />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Announcements Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
              <button 
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" /> Add Announcement
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
                  {announcement.image && (
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={announcement.image} 
                        alt={announcement.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-800">{announcement.title}</h3>
                    <p className="text-gray-600 mb-4">{announcement.content}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Announcement Modal */}
        {isAnnouncementModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Add New Announcement</h3>
                  <button 
                    onClick={() => setIsAnnouncementModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter announcement title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="content">
                      Content
                    </label>
                    <textarea
                      id="content"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                      placeholder="Enter announcement content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                      Image (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        id="image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setNewAnnouncement(prev => ({ ...prev, image: null }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="image" className="cursor-pointer block">
                          <div className="flex flex-col items-center justify-center py-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload an image</p>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsAnnouncementModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" /> Save Announcement
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <footer className="bg-gray-100 py-4 border-t border-gray-200">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Barangay Management System • Lamintak Sur, Medellin, Cebu
          </div>
        </footer>
      </div>
    </div>
  );
}