import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Upload, Activity, User, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function PublisherLibraryTab() {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    resource_type: 'recorded_lecture',
    media_url: '',
    description: '',
    file_size_label: '0MB'
  });
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchLibrary = async () => {
    try {
      const data = await api.getTrainerLibrary();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        media_url: `/uploads/${file.name}`,
        file_size_label: `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Publishing...');
    try {
      if (editingId) {
        await api.updateTrainerLibraryItem(editingId, {
          title: formData.title,
          subject: formData.subject,
          description: formData.description
        });
        setStatus('Updated successfully!');
        setEditingId(null);
      } else {
        await api.uploadTrainerLibrary(formData);
        setStatus('Published successfully to Trainee Library!');
      }
      setFormData({ ...formData, title: '', subject: '', media_url: '', description: '' });
      fetchLibrary();
    } catch (err) {
      setStatus('Error saving.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.deleteTrainerLibraryItem(id);
      fetchLibrary();
    } catch (e) {
      alert('Error deleting item');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      subject: item.subject || '',
      description: item.description || '',
      resource_type: item.resource_type,
      media_url: item.media_url,
      file_size_label: item.file_size_label
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[#14140F] mb-4">{editingId ? 'Edit Resource' : 'Publish to Trainee Library'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-semibold text-[#14140F] mb-1">Title</label>
            <input required className="w-full border p-2 rounded-xl text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#14140F] mb-1">Subject / Topic</label>
            <input required className="w-full border p-2 rounded-xl text-sm" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#14140F] mb-1">Description (Optional)</label>
            <textarea className="w-full border p-2 rounded-xl text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          {!editingId && (
            <div>
              <label className="block text-sm font-semibold text-[#14140F] mb-1">Upload File (PDF / MP4)</label>
              <input required type="file" accept="video/mp4,video/webm,application/pdf" className="w-full border p-2 rounded-xl text-sm" onChange={handleFileChange} />
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" className="bg-[#14140F] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <Upload size={16} /> {editingId ? 'Save Changes' : 'Publish Resource'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', subject: '', description: '', media_url: '', file_size_label: '0MB', resource_type: 'recorded_lecture' }); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-sm font-bold">
                Cancel
              </button>
            )}
          </div>
          {status && <p className="text-sm font-semibold text-[#1B4332] mt-2">{status}</p>}
        </form>
      </div>

      <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[#14140F] mb-4">My Uploaded Resources</h2>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-gray-50">
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.subject} • {item.file_size_label}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-50 rounded">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 text-xs font-bold px-2 py-1 bg-red-50 rounded">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-500">No resources uploaded yet.</p>}
        </div>
      </div>
    </div>
  );
}

export function TraineeTelemetryTab() {
  const [telemetry, setTelemetry] = useState(null);
  
  useEffect(() => {
    api.getTraineeTelemetry().then(setTelemetry).catch(() => {});
  }, []);

  return (
    <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#14140F] mb-4">Trainee Telemetry & Participation</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#FAFAF8] p-4 rounded-xl border border-[#EDEBE6]">
            <h3 className="text-sm font-semibold text-[#5B5850]">Total Enrollments</h3>
            <p className="text-2xl font-bold text-[#1B4332]">{telemetry?.total_enrollments || 0}</p>
          </div>
          <div className="bg-[#FAFAF8] p-4 rounded-xl border border-[#EDEBE6]">
            <h3 className="text-sm font-semibold text-[#5B5850]">Active Trainees</h3>
            <p className="text-2xl font-bold text-[#14140F]">{telemetry?.active_trainees || 0}</p>
          </div>
        </div>
      </div>

      {telemetry?.recent_enrollments && telemetry.recent_enrollments.length > 0 && (
        <div>
          <h3 className="text-md font-bold text-[#14140F] mb-3">Live Course Enrollments</h3>
          <div className="space-y-3">
            {telemetry.recent_enrollments.map((enr, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-[#EDEBE6] bg-[#FAFAF8]">
                <div>
                  <p className="text-sm font-bold text-[#14140F]">{enr.course_name}</p>
                  <p className="text-xs text-[#5B5850]">Enrolled by {enr.trainee_name} • {new Date(enr.enrolled_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 items-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${enr.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-[#E7F0EA] text-[#1B4332]'}`}>
                      {enr.status === 'enrolled' ? 'IN PROGRESS' : enr.status.replace('_', ' ')}
                    </span>
                    {enr.status === 'pending_approval' && (
                      <button 
                        onClick={() => {
                          api.approveEnrollment(enr.id).then(() => {
                            api.getTraineeTelemetry().then(setTelemetry).catch(() => {});
                          });
                        }}
                        className="bg-[#1B4332] text-white text-xs font-bold px-2 py-1 rounded-md hover:bg-[#122e22]"
                      >
                        Accept
                      </button>
                    )}
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TrainerProfileTab() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ interests: '', qualifications: '', certificates: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      await api.updateProfile({
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
        qualifications: formData.qualifications.split(',').map(s => s.trim()).filter(Boolean),
        certificates: formData.certificates.split(',').map(s => s.trim()).filter(Boolean),
      });
      setStatus('Profile updated successfully!');
    } catch (err) {
      setStatus('Error updating profile.');
    }
  };

  return (
    <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6">
      <h2 className="text-xl font-bold text-[#14140F] mb-4">Trainer Professional Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-semibold text-[#14140F] mb-1">Research Interests (comma separated)</label>
          <input className="w-full border p-2 rounded-xl text-sm" value={formData.interests} onChange={e => setFormData({...formData, interests: e.target.value})} placeholder="e.g. Cyclone Dynamics, NWP" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#14140F] mb-1">Qualifications (comma separated)</label>
          <input className="w-full border p-2 rounded-xl text-sm" value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})} placeholder="e.g. Ph.D. Meteorology" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#14140F] mb-1">Certifications (comma separated)</label>
          <input className="w-full border p-2 rounded-xl text-sm" value={formData.certificates} onChange={e => setFormData({...formData, certificates: e.target.value})} placeholder="e.g. WMO Instructor" />
        </div>
        <button type="submit" className="bg-[#14140F] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <User size={16} /> Save Profile
        </button>
        {status && <p className="text-sm font-semibold text-[#1B4332] mt-2">{status}</p>}
      </form>
    </div>
  );
}




export function ManualQuizBuilderTab() {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState([
    { question_text: '', options: ['', '', '', ''], correct_option_index: 0 }
  ]);
  const [status, setStatus] = useState('');

  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', options: ['', '', '', ''], correct_option_index: 0 }]);
  };

  const updateQuestion = (index, field, value) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = value;
    setQuestions(newQ);
  };

  const removeQuestion = (index) => {
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving quiz...');
    try {
      await api.createManualQuiz({ title, deadline: deadline || null, questions });
      setStatus('Quiz created and published successfully!');
      setTitle('');
      setDeadline('');
      setQuestions([{ question_text: '', options: ['', '', '', ''], correct_option_index: 0 }]);
    } catch (err) {
      setStatus('Error creating quiz: ' + err.message);
    }
  };

  return (
    <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6">
      <h2 className="text-xl font-bold text-[#14140F] mb-4">Manual Quiz Builder</h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Quiz Title</label>
            <input required className="w-full border p-2 rounded-xl text-sm" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Midterm Assessment" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Deadline (Optional)</label>
            <input type="datetime-local" className="w-full border p-2 rounded-xl text-sm" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 border rounded-xl bg-gray-50 relative">
              <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-2 right-2 text-red-500 text-xs font-bold px-2 py-1 bg-red-100 rounded">Remove</button>
              <label className="block text-sm font-semibold mb-1">Question {qIndex + 1}</label>
              <input required className="w-full border p-2 rounded-xl text-sm mb-3" value={q.question_text} onChange={e => updateQuestion(qIndex, 'question_text', e.target.value)} placeholder="Enter your question here..." />
              
              <div className="space-y-2 pl-4">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${qIndex}`} checked={q.correct_option_index === oIndex} onChange={() => updateQuestion(qIndex, 'correct_option_index', oIndex)} />
                    <input required className="flex-1 border p-1.5 rounded-lg text-sm" value={opt} onChange={e => updateOption(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button type="button" onClick={addQuestion} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-sm font-bold">+ Add Question</button>
          <button type="submit" className="bg-[#14140F] text-white px-6 py-2 rounded-xl text-sm font-bold">Publish Quiz</button>
        </div>
        {status && <p className="text-sm font-semibold text-[#1B4332] mt-2">{status}</p>}
      </form>
    </div>
  );
}
