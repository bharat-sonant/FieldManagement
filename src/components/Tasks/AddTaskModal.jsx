import { useState, useRef } from 'react'
import { X, Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react'
import styles from './AddTaskModal.module.css'

const CMDS = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList']

const AddTaskModal = ({ type, task, onClose }) => {
  const isKpi  = type === 'kpi'
  const isEdit = !!task

  const [title,         setTitle]         = useState(task?.title || '')
  const [titleError,    setTitleError]    = useState('')
  const [descError,     setDescError]     = useState('')
  const [activeFormats, setActiveFormats] = useState({})
  const editorRef = useRef(null)

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
    const desc = editorRef.current?.innerText?.trim() || ''
    let hasError = false
    if (!title.trim()) { setTitleError('Title is required'); hasError = true } else setTitleError('')
    if (!desc)         { setDescError('Description is required'); hasError = true } else setDescError('')
    if (hasError) return
    console.log(isEdit ? 'Update Task:' : 'New Task:', { title, description: desc, type, id: task?.id })
    onClose()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? (isKpi ? 'Edit KPI Task' : 'Edit Other Task') : (isKpi ? 'Add KPI Task' : 'Add Other Task')}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Title */}
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

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <div className={`${styles.editorWrap} ${descError ? styles.inputError : ''}`}>
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
                onInput={() => { if (descError) setDescError('') }}
                onKeyUp={updateFormats}
                onMouseUp={updateFormats}
                onSelect={updateFormats}
                dangerouslySetInnerHTML={isEdit ? { __html: task?.description || '' } : undefined}
              />
            </div>
            {descError && <span className={styles.error}>{descError}</span>}
          </div>

          <button type="submit" className={`${styles.saveBtn} ${isKpi ? styles.kpiSave : styles.otherSave}`}>
            {isEdit ? 'Update' : 'Save'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default AddTaskModal
