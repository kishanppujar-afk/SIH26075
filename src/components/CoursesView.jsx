import React, { useState, useEffect } from 'react';
import { Play, Sparkles, BookOpen, Video, FileText, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockRecommendations } from '../mock/employeeData';
import { api } from '../api/client';
import Skeleton from './common/Skeleton';
import EmptyState from './common/EmptyState';

export default function CoursesView() {
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [trainerLibrary, setTrainerLibrary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [enrollments, setEnrollments] = useState({});
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Feedback State
  const [reviewCourse, setReviewCourse] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '', clarity_score: 5, relevance_score: 5 });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!reviewCourse) return;
    setIsSubmittingFeedback(true);
    try {
      await api.submitFeedback(reviewCourse.id, feedbackData);
      alert('Feedback submitted successfully!');
      setReviewCourse(null);
    } catch (err) {
      alert('Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const [recs, library, myCourses] = await Promise.all([
          api.getRecommendations().catch(() => mockRecommendations),
          api.getTrainerLibrary().catch(() => []),
          api.getMyCourses().catch(() => [])
        ]);
        if (isMounted) {
          if (Array.isArray(recs) && recs.length > 0) setRecommendations(recs);
          if (Array.isArray(library)) setTrainerLibrary(library);
          if (Array.isArray(myCourses)) {
            const enr = {};
            myCourses.forEach(c => { enr[c.course_id] = c.status === 'pending_approval' ? 'Pending Approval' : (c.status === 'enrolled' ? 'In Progress' : 'Completed'); });
            setEnrollments(enr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEnroll = async (id) => {
    if (enrollments[id]) return; // Already enrolled
    setIsEnrolling(true);
    try {
      await api.enrollCourse(id);
      setEnrollments(prev => ({ ...prev, [id]: 'Pending Approval' }));
    } catch (e) {
      alert("Failed to enroll.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const getEnrollButtonProps = (id) => {
    const status = enrollments[id];
    if (!status) return { text: 'Enroll Now', className: 'btn-primary flex-1 group/btn' };
    if (status === 'In Progress') return { text: 'Approved', className: 'btn-secondary flex-1 bg-teal-50 text-teal-700 border-teal-200' };
    if (status === 'Pending Approval' || status === 'pending_approval') return { text: 'Pending Approval', className: 'btn-secondary flex-1 bg-slate-100 text-slate-700 border-slate-200 cursor-wait' };
    if (status === 'Completed') return { text: 'Completed', className: 'btn-secondary flex-1 bg-teal-50 text-teal-700 border-teal-200 cursor-default' };
    return { text: status || 'Unknown', className: 'btn-secondary flex-1 bg-slate-100 text-slate-700' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
        <Skeleton variant="course-card" count={3} />

        
      </div>
    );
  }

  const mockLibrary = [
    { id: 'lib-1', title: 'DWR Operations & Echo Interpretation', type: 'Recorded Lecture', subject: 'Doppler Weather Radar', size: '45MB' },
    { id: 'lib-2', title: 'INSAT-3D Multispectral Analysis', type: 'Presentation Deck', subject: 'Satellite Meteorology', size: '12MB' },
    { id: 'lib-3', title: 'Tropical Cyclone Warning Guide', type: 'Study Guide', subject: 'Storm Surge Forecasting', size: '5MB' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="typography-display text-slate-900">Upskilling &amp; Learning Pathways</h1>
          <p className="typography-body text-slate-500 mt-1">
            AI-curated learning content and MoES specialized resources
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'courses' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Recommended Courses
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'library' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Trainer Library
          </button>
        </div>
      </div>

      {activeTab === 'courses' ? (
        recommendations.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description="Explore available official courses from NSSTA and MoSPI using the search bar above."
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
            }}
          >
            {recommendations.map((course) => {
              const btnProps = getEnrollButtonProps(course.id);
              return (
              <motion.div
                key={course.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
                }}
                className="card-actionable-ai flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-ai-accent-50 border border-ai-accent-200/70 px-2 py-0.5 text-xs font-semibold text-ai-accent-700">
                      {course.type}
                    </span>
                    {course.isUrgent && (
                      <span className="rounded-full bg-opportunity-50 border border-opportunity-200 px-2.5 py-0.5 text-[11px] font-semibold text-opportunity-700">
                        High Priority Gap
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3.5 typography-h2 text-slate-900 group-hover:text-teal-600 transition-colors duration-150">
                    {course.title}
                  </h3>
                  <p className="mt-1 typography-caption text-slate-500">Provider: {course.provider}</p>

                  <div className="mt-4 rounded-xl bg-slate-50/80 border border-slate-100 p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Target Skill:</span>
                      <strong className="text-slate-800 font-semibold">{course.impactSkill}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>AI Match Score:</span>
                      <strong className="text-ai-accent-600 font-bold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {course.matchScore}%
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Estimated Time:</span>
                      <strong className="text-slate-800 font-semibold">{course.duration}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (enrollments[course.id] === 'In Progress' || enrollments[course.id] === 'Completed') {
                                                    let finalUrl = course.url || '';
                          const isPdf = finalUrl.toLowerCase().endsWith('.pdf') || finalUrl.toLowerCase().endsWith('.ppt') || finalUrl.toLowerCase().endsWith('.pptx');
                          const isVideo = finalUrl.toLowerCase().endsWith('.mp4') || finalUrl.toLowerCase().endsWith('.webm');
                          
                          let forcedResourceType = 'document';
                          if (isVideo) {
                             forcedResourceType = 'recorded_lecture';
                          } else if (isPdf) {
                             forcedResourceType = 'document';
                          } else {
                             forcedResourceType = course.type === 'Video Lecture' ? 'recorded_lecture' : 'document';
                          }

                          if (!finalUrl || finalUrl.startsWith('/uploads/')) {
                             finalUrl = forcedResourceType === 'recorded_lecture' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : 'https://pdfobject.com/pdf/sample.pdf';
                          }

                          setSelectedMedia({ ...course, media_url: finalUrl, resource_type: forcedResourceType });
                        } else {
                          handleEnroll(course.id);
                        }
                      }}
                    className={btnProps.className}
                  >
                    {!enrollments[course.id] && <Play className="h-3.5 w-3.5 fill-current transition-transform duration-200 group-hover/btn:scale-110" />}
                    {enrollments[course.id] === 'Completed' && <CheckCircle className="h-3.5 w-3.5" />}
                    <span>{btnProps.text}</span>
                  </button>
                  <button type="button" onClick={() => setReviewCourse(course)} className="btn-secondary px-4">
                    Review
                  </button>
                </div>
              </motion.div>
            )})}
          </motion.div>
        )
      ) : (
        trainerLibrary.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Trainer Library Empty"
            description="No resources have been published by your trainers yet."
          />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainerLibrary.map((item) => (
            <div key={item.id} onClick={() => {
              let finalUrl = item.media_url || '';
              const isPdf = finalUrl.toLowerCase().endsWith('.pdf') || finalUrl.toLowerCase().endsWith('.ppt') || finalUrl.toLowerCase().endsWith('.pptx');
              const isVideo = finalUrl.toLowerCase().endsWith('.mp4') || finalUrl.toLowerCase().endsWith('.webm');
              
              let forcedResourceType = 'document';
              if (isVideo) {
                 forcedResourceType = 'recorded_lecture';
              } else if (isPdf) {
                 forcedResourceType = 'document';
              } else {
                 forcedResourceType = item.resource_type;
              }

              if (!finalUrl || finalUrl.startsWith('/uploads/')) {
                 finalUrl = forcedResourceType === 'recorded_lecture' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : 'https://pdfobject.com/pdf/sample.pdf';
              }
              
              setSelectedMedia({ ...item, media_url: finalUrl, resource_type: forcedResourceType });
            }} className="card-ambient cursor-pointer flex flex-col justify-between group cursor-pointer hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-3 text-teal-600 bg-teal-50 w-fit p-2 rounded-lg">
                  {item.resource_type === 'recorded_lecture' ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <h3 className="typography-h2 text-slate-900">{item.title}</h3>
                <p className="mt-1 typography-caption text-slate-500">Subject: {item.subject}</p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{item.resource_type}</span>
                <span className="text-xs text-slate-400 font-medium">{item.file_size_label}</span>
              </div>
            </div>
          ))}
        </div>
        )
      )}
        <AnimatePresence>
          {selectedMedia && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
              onClick={() => setSelectedMedia(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">{selectedMedia.title}</h2>
                  <button onClick={() => setSelectedMedia(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 bg-slate-50 p-4 min-h-[500px]">
                  {selectedMedia.resource_type === 'recorded_lecture' || (selectedMedia.media_url && selectedMedia.media_url.endsWith('.mp4')) ? (
                    <video controls autoPlay className="w-full h-full rounded-xl bg-black" src={selectedMedia.media_url} />
                  ) : (
                    <iframe className="w-full h-full rounded-xl bg-white border border-slate-200" src={selectedMedia.media_url} title={selectedMedia.title} />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}



