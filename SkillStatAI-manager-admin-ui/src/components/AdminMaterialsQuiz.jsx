import { PublisherLibraryTab, TraineeTelemetryTab, TrainerProfileTab, ManualQuizBuilderTab } from './TrainerStudioTabs';
import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Breadcrumbs from './Breadcrumbs';
import DashboardSkeleton from './DashboardSkeleton';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Layers,
  Sparkles,
  Share2,
  Trash2,
  BookOpen,
  Eye,
  RefreshCw,
  Clock,
  Check
} from 'lucide-react';

export default function AdminMaterialsQuiz() {
  const { user, token } = useAuth();

  // Material Library State
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [error, setError] = useState(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [associatedTopic, setAssociatedTopic] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

    // Generation State
  const [numQuestions, setNumQuestions] = useState(5);
  const [customTitle, setCustomTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [activeTab, setActiveTab] = useState('quiz_studio');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  // Review & Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Load materials list on mount
  useEffect(() => {
    if (!token) return;
    loadMaterialsList();
  }, [token]);

  async function loadMaterialsList() {
    try {
      setIsLoadingMaterials(true);
      setError(null);
      const list = await api.listMaterials();
      setMaterials(list || []);
      if (list && list.length > 0 && !selectedMaterial) {
        loadMaterialDetails(list[0].id);
      }
    } catch (err) {
      setError(err.message || 'Could not load materials.');
    } finally {
      setIsLoadingMaterials(false);
    }
  }

  async function loadMaterialDetails(materialId) {
    try {
      const details = await api.getMaterial(materialId);
      setSelectedMaterial(details);
      if (details.quizzes && details.quizzes.length > 0) {
        // Load the latest quiz
        const latestQuiz = await api.getQuiz(details.quizzes[0].id);
        setActiveQuiz(latestQuiz);
      } else {
        setActiveQuiz(null);
      }
    } catch (err) {
      console.warn('Failed loading material details:', err);
    }
  }

  // Handle File Upload
  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadStatus('Uploading file and extracting document text...');
      setError(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      if (associatedTopic.trim()) {
        formData.append('associated_topic', associatedTopic.trim());
      }

      const res = await api.uploadMaterial(formData);
      setUploadStatus('Document chunked & vectorized with nomic-embed-text.');

      // Poll until processed if needed
      let currentMat = await api.getMaterial(res.id);
      let attempts = 0;
      while (currentMat.status === 'processing' && attempts < 10) {
        await new Promise((r) => setTimeout(r, 1000));
        currentMat = await api.getMaterial(res.id);
        attempts++;
      }

      setUploadStatus('');
      setSelectedFile(null);
      setAssociatedTopic('');
      await loadMaterialsList();
      await loadMaterialDetails(res.id);
      setSuccessNotice(`Document "${res.filename}" successfully uploaded and indexed!`);
      setTimeout(() => setSuccessNotice(''), 5000);
    } catch (err) {
      setError(err.message || 'File upload failed.');
      setUploadStatus('');
    } finally {
      setIsUploading(false);
    }
  }

  // Handle Quiz Generation
  async function handleGenerateQuiz() {
    if (!selectedMaterial) return;

    try {
      setIsGenerating(true);
      setError(null);
      setGenerationStep('Sampling spread document chunks across intro, body & conclusion...');

      await new Promise((r) => setTimeout(r, 600));
      setGenerationStep('Gemma 3:4B is generating grounded diagnostic questions with source snippets...');

      const quiz = await api.generateQuiz(
        selectedMaterial.id,
        numQuestions,
        customTitle.trim() || null,
          deadline || null
      );

      setGenerationStep('Finalizing question reviews...');
      setActiveQuiz(quiz);
      await loadMaterialDetails(selectedMaterial.id);
      setSuccessNotice(`Generated ${quiz.questions.length} questions from ${selectedMaterial.filename}!`);
      setTimeout(() => setSuccessNotice(''), 5000);
    } catch (err) {
      setError(err.message || 'Quiz generation failed.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  }

  // Handle Publish / Unpublish Toggle
  async function handleTogglePublish() {
    if (!activeQuiz) return;

    try {
      setIsPublishing(true);
      setError(null);
      const newStatus = !activeQuiz.is_published;
      const updated = await api.publishQuiz(activeQuiz.id, newStatus);
      setActiveQuiz(updated);
      await loadMaterialDetails(selectedMaterial.id);
      setSuccessNotice(
        newStatus
          ? 'Quiz published! It is now live in the employee Assessment Hub under Practice / Reference.'
          : 'Quiz unpublished from employee Assessment Hub.'
      );
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (err) {
      setError(err.message || 'Could not update publication state.');
    } finally {
      setIsPublishing(false);
    }
  }

  // Handle Material Deletion
  async function handleDeleteMaterial(matId) {
    if (!window.confirm('Are you sure you want to delete this material and its associated quizzes?')) return;
    try {
      await api.deleteMaterial(matId);
      if (selectedMaterial?.id === matId) {
        setSelectedMaterial(null);
        setActiveQuiz(null);
      }
      await loadMaterialsList();
    } catch (err) {
      setError(err.message || 'Failed deleting material.');
    }
  }

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin' && user.role !== 'trainer') return <Navigate to="/login" replace />;

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <Breadcrumbs trail={[{ label: 'Trainer Studio', to: '/admin/materials' }]} />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#14140F]">Trainer Studio</h1>
          <p className="text-sm text-[#5B5850] mt-1">
            RAG-powered assessment generation for official MoES &amp; IMD training documents.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="bg-[#E7F0EA] border border-[#1B4332]/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle size={18} className="text-[#1B4332] shrink-0" />
          <p className="text-sm font-medium text-[#1B4332]">{successNotice}</p>
        </div>
      )}

      {error && (
        <div className="bg-[#FCEDEB] border border-[#B23A2E]/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} className="text-[#B23A2E] shrink-0" />
          <p className="text-sm text-[#B23A2E]">{error}</p>
        </div>
      )}

      {/* Grid: Left Column (Upload & Library) / Right Column (Generate, Review & Publish) */}
      <div className="flex gap-2 mb-6 border-b border-[#EDEBE6] pb-2">
          {['quiz_studio', 'manual_quiz', 'publisher', 'telemetry', 'profile'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === tab ? 'bg-[#14140F] text-white' : 'text-[#5B5850] hover:bg-[#FAFAF9]'}`}
            >
              {tab === 'quiz_studio' ? 'RAG Quiz Generator' : tab === 'manual_quiz' ? 'Manual Quiz Builder' : tab === 'publisher' ? 'Upload Notes & PPTs' : tab === 'telemetry' ? 'Trainee Telemetry' : 'Trainer Profile'}
            </button>
          ))}
        </div>

        {activeTab === 'publisher' && <PublisherLibraryTab />}
        {activeTab === 'manual_quiz' && <ManualQuizBuilderTab />}
        {activeTab === 'telemetry' && <TraineeTelemetryTab />}
        {activeTab === 'profile' && <TrainerProfileTab />}

        {activeTab === 'quiz_studio' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload & Materials List */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upload Card */}
          <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#14140F] flex items-center gap-2 mb-3">
              <Upload size={18} className="text-[#14140F]" />
              Upload Training Material
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5B5850] uppercase tracking-wider mb-1.5">
                  Document File (PDF or TXT)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.csv"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="w-full text-xs text-[#5B5850] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#14140F] file:text-white hover:file:bg-[#2B2A24] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B5850] uppercase tracking-wider mb-1.5">
                  Associated Competency / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. National Accounts & GDP, PLFS Sampling"
                  value={associatedTopic}
                  onChange={(e) => setAssociatedTopic(e.target.value)}
                  className="w-full border border-[#EDEBE6] rounded-xl px-3 py-2 text-sm text-[#14140F] placeholder:text-[#A8A59C] focus:outline-none focus:border-[#14140F]"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="w-full bg-[#14140F] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#2B2A24] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    <span>Upload &amp; Index Chunks</span>
                  </>
                )}
              </button>
              {uploadStatus && (
                <p className="text-xs text-[#5B5850] text-center animate-pulse">{uploadStatus}</p>
              )}
            </form>
          </div>

          {/* Materials Library */}
          <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#14140F] flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <FileText size={18} className="text-[#14140F]" />
                Indexed Documents
              </span>
              <span className="text-xs font-semibold text-[#5B5850] bg-[#F4F3EF] px-2 py-0.5 rounded-full">
                {materials.length}
              </span>
            </h2>

            {isLoadingMaterials ? (
              <div className="space-y-2 py-4">
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ) : materials.length === 0 ? (
              <p className="text-xs text-[#5B5850] py-6 text-center">
                No documents uploaded yet. Upload an official PDF or TXT above to get started.
              </p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {materials.map((m) => {
                  const isSelected = selectedMaterial?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => loadMaterialDetails(m.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#14140F] bg-[#FAFAF8] shadow-xs'
                          : 'border-[#EDEBE6] hover:bg-[#FAFAF9]'
                      }`}
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-sm font-medium text-[#14140F] truncate">{m.filename}</p>
                        <p className="text-xs text-[#5B5850] mt-0.5">
                          {m.associated_course_topic || 'Official Topic'} &middot; {m.chunks_count} chunks
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.status === 'processed'
                              ? 'bg-[#E7F0EA] text-[#1B4332]'
                              : m.status === 'processing'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {m.status}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMaterial(m.id);
                          }}
                          className="text-[#A8A59C] hover:text-[#B23A2E] p-1 rounded transition-colors"
                          title="Delete material"
                        >
                          <Trash2 size={13} />
                        </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Generation, Review, Publish */}
        <div className="lg:col-span-7 space-y-6">
          {selectedMaterial ? (
            <>
              {/* Document Overview & Generate Card */}
              <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5B5850]">
                      Active Document
                    </span>
                    <h2 className="text-xl font-bold text-[#14140F] mt-0.5">
                      {selectedMaterial.filename}
                    </h2>
                    <p className="text-xs text-[#5B5850] mt-1">
                      {selectedMaterial.associated_course_topic || 'General Official Practice'} &middot;{' '}
                      {selectedMaterial.char_count} characters &middot; {selectedMaterial.chunks_count} RAG chunks
                    </p>
                  </div>

                  <span className="text-xs font-medium bg-[#F4F3EF] px-2.5 py-1 rounded-full text-[#5B5850]">
                    {selectedMaterial.quizzes?.length || 0} Quiz Generated
                  </span>
                </div>

                <div className="border-t border-[#F4F3EF] pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-[#14140F] mb-3">Generate Diagnostic Quiz</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-[#5B5850] mb-1">
                        Question Count
                      </label>
                      <select
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="w-full border border-[#EDEBE6] rounded-xl px-3 py-2 text-sm text-[#14140F] bg-white focus:outline-none focus:border-[#14140F]"
                      >
                        <option value={3}>3 Questions</option>
                        <option value={5}>5 Questions (Recommended)</option>
                        <option value={7}>7 Questions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#5B5850] mb-1">
                        Quiz Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder={`Diagnostic Checkpoint: ${selectedMaterial.associated_course_topic || 'Official'}`}
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#5B5850]">Assessment Deadline (Optional)</label>
                        <input
                          type="datetime-local"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                        className="w-full border border-[#EDEBE6] rounded-xl px-3 py-2 text-sm text-[#14140F] placeholder:text-[#A8A59C] focus:outline-none focus:border-[#14140F]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateQuiz}
                    disabled={isGenerating || selectedMaterial.status !== 'processed'}
                    className="w-full bg-[#1F3A5F] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#16293F] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Generating RAG Questions...</span>
                      </>
                    ) : (
                      <>
                        <Layers size={15} />
                        <span>Generate Grounded RAG Quiz</span>
                      </>
                    )}
                  </button>

                  {isGenerating && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                      <Clock size={14} className="animate-spin shrink-0 text-blue-600" />
                      <span>{generationStep}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review & Publish Workspace */}
              {activeQuiz && (
                <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDEBE6]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#14140F]">{activeQuiz.title}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            activeQuiz.generated_by === 'local_llm'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {activeQuiz.generated_by === 'local_llm' ? 'Gemma 3:4B' : 'Template Fallback'}
                        </span>
                      </div>
                      <p className="text-xs text-[#5B5850] mt-1">
                        {activeQuiz.questions.length} questions &middot; Grounded in paragraph chunks
                      </p>
                    </div>

                    {/* Publish Toggle Button */}
                    <button
                      type="button"
                      onClick={handleTogglePublish}
                      disabled={isPublishing}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeQuiz.is_published
                          ? 'bg-[#E7F0EA] text-[#1B4332] border border-[#1B4332]/30 hover:bg-[#d5e7db]'
                          : 'bg-[#14140F] text-white hover:bg-[#2B2A24]'
                      }`}
                    >
                      {activeQuiz.is_published ? (
                        <>
                          <Check size={14} />
                          <span>Published (Click to Unpublish)</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={14} />
                          <span>Publish to Assessment Hub</span>
                        </>
                      )}
                    </button>
                  </div>

                  {activeQuiz.is_published && (
                    <div className="p-3 bg-[#E7F0EA]/60 border border-[#1B4332]/20 rounded-xl text-xs text-[#1B4332] flex items-center gap-2">
                      <CheckCircle size={15} className="text-[#1B4332] shrink-0" />
                      <span>
                        Live in Employee Assessment Hub as a self-paced practice quiz. Results do not modify official baseline metrics.
                      </span>
                    </div>
                  )}

                  {/* Questions Review List */}
                  <div className="space-y-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B5850]">
                      Question Review &amp; Source Grounding
                    </h4>

                    {activeQuiz.questions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="p-4 rounded-xl border border-[#EDEBE6] bg-[#FAFAF9] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-[#14140F] bg-white border border-[#EDEBE6] px-2 py-0.5 rounded-md">
                            Q{idx + 1}
                          </span>
                          <span className="text-xs text-[#5B5850]">Multiple Choice</span>
                        </div>

                        <p className="text-sm font-semibold text-[#14140F]">{q.question_text}</p>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-1.5 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.correct_option_index;
                            return (
                              <div
                                key={oIdx}
                                className={`text-xs p-2.5 rounded-lg border flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-[#E7F0EA] border-[#1B4332]/30 text-[#1B4332] font-semibold'
                                    : 'bg-white border-[#EDEBE6] text-[#5B5850]'
                                }`}
                              >
                                <span>
                                  <strong className="mr-1.5">{String.fromCharCode(65 + oIdx)}.</strong>
                                  {opt}
                                </span>
                                {isCorrect && (
                                  <span className="text-[10px] font-bold text-[#1B4332] bg-white px-2 py-0.5 rounded-full shrink-0">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="pt-2 text-xs text-[#5B5850] border-t border-[#EDEBE6]">
                            <strong className="text-[#14140F]">Explanation: </strong>
                            {q.explanation}
                          </div>
                        )}

                        {/* Grounding Source Snippet */}
                        {q.source_snippet && (
                          <div className="p-3 bg-white border border-dashed border-[#EDEBE6] rounded-lg">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B5850] flex items-center gap-1 mb-1">
                              <BookOpen size={12} className="text-[#14140F]" />
                              Grounded Source Snippet
                            </span>
                            <p className="text-xs text-[#5B5850] italic line-clamp-3">
                              "{q.source_snippet}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-[#EDEBE6] rounded-2xl p-12 text-center text-[#5B5850]">
              <FileText size={36} className="mx-auto text-[#A8A59C] mb-3" />
              <p className="text-base font-semibold text-[#14140F]">No Document Selected</p>
              <p className="text-xs text-[#5B5850] mt-1 max-w-sm mx-auto">
                Upload a training PDF or text document, or select one from the library on the left to review chunks and generate quizzes.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    )}
  </div>
  );
}
