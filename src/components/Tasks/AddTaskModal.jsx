import { useState, useRef, useEffect } from 'react'
import { X, Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react'
import { addTask, updateTask } from '../../actions/Tasks/tasksAction'
import { setAlertMessage } from '../../utils/setAlertMessage'
import styles from './AddTaskModal.module.css'

const CMDS = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList']

const AddTaskModal = ({ task, onClose, onSuccess }) => {
  const isEdit = !!task

  const [title,         setTitle]         = useState(task?.title || '')
  const [titleError,    setTitleError]    = useState('')
  const [activeFormats, setActiveFormats] = useState({})
  const [loading,       setLoading]       = useState(false)
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && task?.description) {
      editorRef.current.innerText = task.description
    }
  }, [])

  const updateFormats = () => {
    const state = {}
    CMDS.forEach((cmd) => { state[cmd] = document.queryCommandState(cmd) })
    setActiveFormats(state)
  }

  const exec = (e, cmd) => {
    e.preventDefault()
    document.execCommand(cmd, false, null)
    updateFormats()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) { setTitleError('Title is required'); return }

    const description = editorRef.current?.innerText?.trim() || ''
    const formData    = { title: title.trim(), description }

    if (isEdit) {
      updateTask({
        id: task.id,
        ...formData,
        setLoading,
        onSuccess: (data) => onSuccess(data, formData),
        onError:   (msg)  => setAlertMessage('error', msg),
      })
    } else {
      addTask({
        ...formData,
        setLoading,
        onSuccess: (data) => onSuccess(data, formData),
        onError:   (msg)  => setAlertMessage('error', msg),
      })
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'Edit Task' : 'Add Task'}</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={loading}><X size={18} /></button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          <div className={styles.field}>
            <label className={styles.label}>Task Title</label>
            <input
              className={`${styles.input} ${titleError ? styles.inputError : ''}`}
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError('') }}
              placeholder="Enter task title"
            />
            {titleError && <span className={styles.error}>{titleError}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <div className={styles.editorWrap}>
              <div className={styles.toolbar}>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['bold'] ? styles.toolActive : ''}`} onMouseDown={(e) => exec(e, 'bold')}><Bold size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['italic'] ? styles.toolActive : ''}`} onMouseDown={(e) => exec(e, 'italic')}><Italic size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['underline'] ? styles.toolActive : ''}`} onMouseDown={(e) => exec(e, 'underline')}><Underline size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['strikeThrough'] ? styles.toolActive : ''}`} onMouseDown={(e) => exec(e, 'strikeThrough')}><Strikethrough size={14} /></button>
                <div className={styles.toolDivider} />
                <button type="button" className={`${styles.toolBtn} ${activeFormats['insertUnorderedList'] ? styles.toolActive : ''}`} onMouseDown={(e) => exec(e, 'insertUnorderedList')}><List size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['insertOrderedList'] ? styles.toolActive : ''}`} onMouseDown={(e) => exec(e, 'insertOrderedList')}><ListOrdered size={14} /></button>
              </div>
              <div
                ref={editorRef}
                className={styles.editor}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Start writing..."
                onKeyUp={updateFormats}
                onMouseUp={updateFormats}
                onSelect={updateFormats}
              />
            </div>
          </div>

          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update' : 'Save')}
          </button>

        </form>
      </div>
    </div>
  )
}

export default AddTaskModal
