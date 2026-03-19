import { useState, useEffect, useRef } from 'react'
import { ClipboardList, CheckCircle2, Clock, AlertCircle, PauseCircle, Loader2, MessageSquare, Send, X } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import { supabase } from '../utils/supabase'
import { fetchComments, addComment } from '../actions/Comments/commentsAction'
import styles from './Tracking.module.css'

const STATUS_LABEL = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', PAUSED: 'Paused' }
const STATUS_CLASS  = { PENDING: 'pending', IN_PROGRESS: 'inProgress', COMPLETED: 'completed', PAUSED: 'paused' }

const parseProofUrls = (val) => {
  if (!val) return []
  try { return JSON.parse(val) } catch { return [val] }
}

const fetchTaskTracking = async ({ setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FETaskAssignments')
      .select('*, FETasks(*), FieldExecutives(name, employee_id)')
      .order('created_at', { ascending: false })

    if (error) { onError(error.message); return }

    onSuccess(data.map(a => ({
      id:          a.id,
      title:       a.FETasks?.title       || '',
      description: a.FETasks?.description || '',
      taskType:    a.task_type,
      status:      a.status || 'PENDING',
      workerName:  a.FieldExecutives?.name        || a.employee_id,
      employeeId:  a.FieldExecutives?.employee_id || a.employee_id,
      assignedBy:  a.assigned_by,
      completionNote: a.completion_note || '',
      completedAt: a.completed_at || null,
      proofUrls:   parseProofUrls(a.proof_url),
      createdAt:   a.created_at,
      commentCount: 0,
    })))
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

const Tracking = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [tasks,          setTasks]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [filter,         setFilter]         = useState('ALL')
  const [search,         setSearch]         = useState('')
  const [commentTask,    setCommentTask]    = useState(null)   // task row for comments drawer
  const [comments,       setComments]       = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentText,    setCommentText]    = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const channelRef    = useRef(null)
  const openTaskIdRef = useRef(null)
  const drawerBodyRef = useRef(null)

  useEffect(() => {
    fetchTaskTracking({ setLoading, onSuccess: setTasks, onError: () => {} })
  }, [])

  // global badge counter — increments only when drawer is closed for that task
  useEffect(() => {
    const ch = supabase
      .channel('tracking-badge')
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'FETaskComments',
      }, (payload) => {
        const taskId = payload.new.assignment_id
        if (openTaskIdRef.current === taskId) return  // drawer open, admin can see it
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, commentCount: t.commentCount + 1 } : t
        ))
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  // auto-scroll to bottom when comments change
  useEffect(() => {
    if (drawerBodyRef.current) {
      drawerBodyRef.current.scrollTop = drawerBodyRef.current.scrollHeight
    }
  }, [comments])

  // realtime: update task status when FE changes it
  useEffect(() => {
    const ch = supabase
      .channel('tracking-status-updates')
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'FETaskAssignments',
      }, (payload) => {
        const u = payload.new
        setTasks(prev => prev.map(t =>
          t.id === u.id
            ? {
                ...t,
                status:         u.status,
                completedAt:    u.completed_at || null,
                completionNote: u.completion_note || '',
              }
            : t
        ))
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const closeComments = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    openTaskIdRef.current = null
    setCommentTask(null)
  }

  const openComments = (task) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    openTaskIdRef.current = task.id
    setCommentTask(task)
    setComments([])
    setCommentText('')
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, commentCount: 0 } : t))
    setCommentsLoading(true)
    fetchComments({
      assignmentId: task.id,
      onSuccess: (data) => { setComments(data); setCommentsLoading(false) },
      onError:   ()     => setCommentsLoading(false),
    })
    // realtime: listen for new comments on this task
    channelRef.current = supabase
      .channel(`tracking-comments-${task.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'FETaskComments',
        filter: `assignment_id=eq.${task.id}`,
      }, (payload) => {
        const c = payload.new
        setComments(prev => {
          if (prev.some(x => x.id === c.id)) return prev
          return [...prev, {
            id:          c.id,
            assignmentId: c.assignment_id,
            commentedBy: c.commented_by,
            role:        c.role,
            comment:     c.comment,
            createdAt:   c.created_at,
          }]
        })
      })
      .subscribe()
  }

  const handleSendComment = () => {
    if (!commentText.trim() || !commentTask) return
    addComment({
      assignmentId: commentTask.id,
      comment:      commentText.trim(),
      commentedBy:  user.name || user.employeeId || 'Admin',
      role:         'ADMIN',
      setLoading:   setSendingComment,
      onSuccess: (newComment) => {
        setComments(prev => [...prev, newComment])
        setCommentText('')
      },
      onError: () => {},
    })
  }

  const filtered = tasks
    .filter(t => filter === 'ALL' || t.status === filter)
    .filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.workerName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.commentCount > 0 ? 1 : 0) - (a.commentCount > 0 ? 1 : 0))

  const counts = {
    total:      tasks.length,
    pending:    tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    paused:     tasks.filter(t => t.status === 'PAUSED').length,
    completed:  tasks.filter(t => t.status === 'COMPLETED').length,
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>Task Tracking</h1>
            <p className={styles.sub}>Monitor all field tasks and their current status</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.sBlue}`}>
            <div className={`${styles.sIcon} ${styles.sIconBlue}`}><ClipboardList size={20} /></div>
            <div>
              <p className={styles.sNum}>{counts.total}</p>
              <p className={styles.sLabel}>Total Tasks</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.sYellow}`}>
            <div className={`${styles.sIcon} ${styles.sIconYellow}`}><Clock size={20} /></div>
            <div>
              <p className={styles.sNum}>{counts.pending}</p>
              <p className={styles.sLabel}>Pending</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.sOrange}`}>
            <div className={`${styles.sIcon} ${styles.sIconOrange}`}><AlertCircle size={20} /></div>
            <div>
              <p className={styles.sNum}>{counts.inProgress}</p>
              <p className={styles.sLabel}>In Progress</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.sPurple}`}>
            <div className={`${styles.sIcon} ${styles.sIconPurple}`}><PauseCircle size={20} /></div>
            <div>
              <p className={styles.sNum}>{counts.paused}</p>
              <p className={styles.sLabel}>Paused</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.sGreen}`}>
            <div className={`${styles.sIcon} ${styles.sIconGreen}`}><CheckCircle2 size={20} /></div>
            <div>
              <p className={styles.sNum}>{counts.completed}</p>
              <p className={styles.sLabel}>Completed</p>
            </div>
          </div>
        </div>

        <div className={styles.scrollArea}>
        {/* Filters */}
        <div className={styles.filterBar}>
          <div className={styles.tabs}>
            {['ALL', 'PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED'].map(f => (
              <button
                key={f}
                className={`${styles.tab} ${filter === f ? styles.tabActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
          <input
            className={styles.search}
            placeholder="Search task or worker..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className={styles.card}>
          {loading ? (
            <div className={styles.center}><Loader2 size={24} className={styles.spin} /></div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>No tasks found</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Assigned On</th>
                  <th>Completed At</th>
                  <th>Proof</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td>
                      <p className={styles.taskTitle}>{t.title}</p>
                      {t.completionNote && (
                        <p className={styles.taskNote} title={t.completionNote}>"{t.completionNote}"</p>
                      )}
                    </td>
                    <td>
                      <div className={styles.workerCell}>
                        <div className={styles.avatar}>{t.workerName[0]}</div>
                        <div>
                          <p className={styles.wName}>{t.workerName}</p>
                          <p className={styles.wId}>{t.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.typeBadge}>{t.taskType}</span></td>
                    <td>
                      <span className={`${styles.badge} ${styles[STATUS_CLASS[t.status]]}`}>
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={styles.dateCell}>
                      {t.completedAt
                        ? new Date(t.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '--'}
                    </td>
                    <td>
                      {t.proofUrls?.length > 0
                        ? <div className={styles.proofLinks}>
                            {t.proofUrls.map((url, i) => (
                              <a key={i} href={url} target={`proof-${t.id}-${i}`} rel="noreferrer" className={styles.proofLink}>
                                {i + 1}
                              </a>
                            ))}
                          </div>
                        : <span className={styles.noProof}>--</span>}
                    </td>
                    <td>
                      <button className={styles.commentBtn} onClick={() => openComments(t)}>
                        <MessageSquare size={14} />
                        {t.commentCount > 0 && (
                          <span className={styles.commentCount}>{t.commentCount}</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        </div>

      </div>

      {/* Comments Drawer */}
      {commentTask && (
        <div className={styles.drawerOverlay} onClick={() => closeComments()}>
          <div className={styles.commentsDrawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <p className={styles.drawerTitle}>Comments</p>
                <p className={styles.drawerSub}>{commentTask.title}</p>
              </div>
              <button className={styles.drawerClose} onClick={() => closeComments()}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.drawerBody} ref={drawerBodyRef}>
              {commentsLoading ? (
                <div className={styles.center}><Loader2 size={20} className={styles.spin} /></div>
              ) : comments.length === 0 ? (
                <p className={styles.noComments}>No comments yet</p>
              ) : (
                comments.map(c => {
                  const isMe = c.role === 'ADMIN'
                  return (
                    <div key={c.id} className={`${styles.bubble} ${isMe ? styles.bubbleRight : styles.bubbleLeft}`}>
                      <span className={styles.bubbleName}>
                        {c.commentedBy}
                        <span className={`${styles.commentRole} ${isMe ? styles.roleAdmin : styles.roleFE}`}>
                          {isMe ? 'Admin' : 'FE'}
                        </span>
                      </span>
                      <p className={styles.bubbleText}>{c.comment}</p>
                      <span className={styles.bubbleTime}>
                        {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            <div className={styles.drawerFooter}>
              <input
                className={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
                disabled={sendingComment}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSendComment}
                disabled={sendingComment || !commentText.trim()}
              >
                {sendingComment ? <Loader2 size={15} className={styles.spin} /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Tracking
