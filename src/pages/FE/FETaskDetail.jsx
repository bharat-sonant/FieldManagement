import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, PauseCircle, PlayCircle, Loader2, Camera, X, Send } from 'lucide-react'
import { fetchAssignedTasks, updateTaskStatus, uploadProofs } from '../../actions/TaskAssigned/taskAssignedAction'
import { fetchComments, addComment } from '../../actions/Comments/commentsAction'
import { supabase } from '../../utils/supabase'
import styles from './FETaskDetail.module.css'

const STATUS_LABEL = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', PAUSED: 'Paused' }
const STATUS_CLASS  = { PENDING: 'pending', IN_PROGRESS: 'inProgress', COMPLETED: 'completed', PAUSED: 'paused' }
const MAX_PHOTOS   = 3

const FETaskDetail = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const user        = JSON.parse(localStorage.getItem('user') || '{}')
  const fileRef        = useRef(null)
  const commentListRef = useRef(null)

  const [task,           setTask]           = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [updating,       setUpdating]       = useState(false)
  const [note,           setNote]           = useState('')
  const [photos,         setPhotos]         = useState([])   // { file, preview }
  const [uploadErr,      setUploadErr]      = useState('')
  const [comments,       setComments]       = useState([])
  const [commentText,    setCommentText]    = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    fetchAssignedTasks({
      employeeId: user.employeeId,
      setLoading,
      onSuccess: (tasks) => {
        const found = tasks.find(t => t.id === id)
        if (found) {
          setTask(found)
          setNote(found.completionNote || '')
          fetchComments({
            assignmentId: id,
            onSuccess: setComments,
            onError:   () => {},
          })
        }
      },
      onError: () => {},
    })
  }, [id, user.employeeId])

  // realtime: listen for new comments on this task
  useEffect(() => {
    const channel = supabase
      .channel(`fe-task-comments-${id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'FETaskComments',
        filter: `assignment_id=eq.${id}`,
      }, (payload) => {
        const c = payload.new
        setComments(prev => {
          if (prev.some(x => x.id === c.id)) return prev
          return [...prev, {
            id:           c.id,
            assignmentId: c.assignment_id,
            commentedBy:  c.commented_by,
            role:         c.role,
            comment:      c.comment,
            createdAt:    c.created_at,
          }]
        })
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  // auto-scroll to latest comment
  useEffect(() => {
    if (commentListRef.current) {
      commentListRef.current.scrollTop = commentListRef.current.scrollHeight
    }
  }, [comments])

  const handleAddComment = () => {
    if (!commentText.trim()) return
    addComment({
      assignmentId: id,
      comment:      commentText.trim(),
      commentedBy:  user.name || user.employeeId,
      role:         'FIELD_EXECUTIVE',
      setLoading:   setCommentLoading,
      onSuccess: (newComment) => {
        setComments(prev => [...prev, newComment])
        setCommentText('')
      },
      onError: () => {},
    })
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    const remaining = MAX_PHOTOS - photos.length
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPhotos(prev => [...prev, ...toAdd])
    setUploadErr('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdate = async (nextStatus) => {
    if (!task) return

    if (nextStatus === 'COMPLETED') {
      if (!note.trim()) { setUploadErr('Note likhna zaroori hai.'); return }
      if (photos.length === 0) { setUploadErr('Kam se kam 1 photo attach karo.'); return }
    }

    let proofUrls = []
    if (nextStatus === 'COMPLETED' && photos.length > 0) {
      try {
        proofUrls = await uploadProofs({
          files:      photos.map(p => p.file),
          employeeId: user.employeeId,
          taskId:     task.id,
        })
      } catch {
        setUploadErr('Photo upload failed. Try again.')
        return
      }
    }

    updateTaskStatus({
      id:             task.id,
      status:         nextStatus,
      completionNote: nextStatus === 'COMPLETED' ? note : undefined,
      proofUrls:      proofUrls.length ? proofUrls : undefined,
      setLoading:     setUpdating,
      onSuccess: () => {
        setTask(prev => ({ ...prev, status: nextStatus, completionNote: note, proofUrls }))
        setPhotos([])
        setUploadErr('')
      },
      onError: () => {},
    })
  }

  if (loading) return (
    <div className={styles.center}><Loader2 size={28} className={styles.spin} /></div>
  )

  if (!task) return (
    <div className={styles.center}><p>Task not found</p></div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/fe/home')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.headerTitle}>Task Detail</h1>
      </div>

      <div className={styles.content}>
        {/* Task Info */}
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={`${styles.badge} ${styles[STATUS_CLASS[task.status]]}`}>
              {STATUS_LABEL[task.status]}
            </span>
            <span className={styles.taskType}>{task.taskType}</span>
          </div>
          <h2 className={styles.title}>{task.title}</h2>
          {task.description && <p className={styles.desc}>{task.description}</p>}
          <p className={styles.meta}>Assigned: {new Date(task.createdAt).toLocaleDateString('en-IN')}</p>
          {task.completedAt && (
            <p className={styles.meta}>Completed: {new Date(task.completedAt).toLocaleDateString('en-IN')}</p>
          )}
        </div>

        {/* Completed — show note + proofs */}
        {task.status === 'COMPLETED' && (
          <>
            {task.completionNote && (
              <div className={styles.noteCard}>
                <p className={styles.noteLabel}>Completion Note</p>
                <p className={styles.noteText}>{task.completionNote}</p>
              </div>
            )}
            {task.proofUrls?.length > 0 && (
              <div className={styles.noteCard}>
                <p className={styles.noteLabel}>Proof Photos ({task.proofUrls.length})</p>
                <div className={styles.proofGrid}>
                  {task.proofUrls.map((url, i) => (
                    <img key={i} src={url} alt={`proof ${i + 1}`} className={styles.proofThumb} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* In Progress / Paused — note + photo upload */}
        {(task.status === 'IN_PROGRESS' || task.status === 'PAUSED') && (
          <>
            <div className={styles.noteCard}>
              <p className={styles.noteLabel}>Add a note *</p>
              <textarea
                className={styles.textarea}
                placeholder="Describe what you did..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className={styles.noteCard}>
              <p className={styles.noteLabel}>
                Proof Photos * ({photos.length}/{MAX_PHOTOS})
              </p>

              {photos.length > 0 && (
                <div className={styles.proofGrid}>
                  {photos.map((p, i) => (
                    <div key={i} className={styles.thumbWrap}>
                      <img src={p.preview} alt={`photo ${i + 1}`} className={styles.proofThumb} />
                      <button className={styles.removeThumb} onClick={() => removePhoto(i)}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < MAX_PHOTOS && (
                <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
                  <Camera size={18} /> Add Photo
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              {uploadErr && <p className={styles.errText}>{uploadErr}</p>}
            </div>
          </>
        )}

        {/* Action Button */}
        {task.status === 'COMPLETED' ? (
          <div className={styles.doneBox}>
            <CheckCircle2 size={20} color="#10b981" />
            <span>Task Completed</span>
          </div>
        ) : task.status === 'PENDING' ? (
          <button className={styles.actionBtn} onClick={() => handleUpdate('IN_PROGRESS')} disabled={updating}>
            {updating ? <Loader2 size={18} className={styles.spin} /> : 'Start Task'}
          </button>
        ) : task.status === 'PAUSED' ? (
          <button className={styles.actionBtn} onClick={() => handleUpdate('IN_PROGRESS')} disabled={updating}>
            {updating ? <Loader2 size={18} className={styles.spin} /> : <><PlayCircle size={18} /> Resume Task</>}
          </button>
        ) : task.status === 'IN_PROGRESS' ? (
          <div className={styles.actionRow}>
            <button className={styles.pauseBtn} onClick={() => handleUpdate('PAUSED')} disabled={updating}>
              {updating ? <Loader2 size={16} className={styles.spin} /> : <><PauseCircle size={16} /> Pause</>}
            </button>
            <button className={styles.actionBtn} onClick={() => handleUpdate('COMPLETED')} disabled={updating}>
              {updating ? <Loader2 size={18} className={styles.spin} /> : 'Mark as Completed'}
            </button>
          </div>
        ) : null}

        {/* Comments Section */}
        <div className={styles.noteCard}>
          <p className={styles.noteLabel}>Comments ({comments.length})</p>
          {comments.length > 0 && (
            <div className={styles.commentList} ref={commentListRef}>
              {comments.map(c => {
                const isMe = c.role === 'FIELD_EXECUTIVE'
                return (
                  <div key={c.id} className={`${styles.bubble} ${isMe ? styles.bubbleRight : styles.bubbleLeft}`}>
                    <span className={styles.bubbleName}>
                      {c.commentedBy}
                      <span className={`${styles.commentRole} ${isMe ? styles.roleFE : styles.roleAdmin}`}>
                        {isMe ? 'FE' : 'Admin'}
                      </span>
                    </span>
                    <p className={styles.bubbleText}>{c.comment}</p>
                    <span className={styles.bubbleTime}>
                      {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <div className={styles.commentInputRow}>
            <input
              className={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
              disabled={commentLoading}
            />
            <button
              className={styles.commentSendBtn}
              onClick={handleAddComment}
              disabled={commentLoading || !commentText.trim()}
            >
              {commentLoading ? <Loader2 size={16} className={styles.spin} /> : <Send size={16} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default FETaskDetail
