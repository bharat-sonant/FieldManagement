import { useState, useRef, useEffect } from 'react'
import { X, Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react'
import { addTask, updateTask } from '../../actions/Tasks/tasksAction'
import { setAlertMessage } from '../../utils/setAlertMessage'
import styles from './AddTaskModal.module.css'

const FORMAT_MAP = {
  bold:          'strong',
  italic:        'em',
  underline:     'u',
  strikeThrough: 's',
}

const getActiveFormats = () => {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return {}
  const node = sel.getRangeAt(0).commonAncestorContainer
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
  return {
    bold:                !!(el.closest('strong') || el.closest('b')),
    italic:              !!(el.closest('em') || el.closest('i')),
    underline:           !!el.closest('u'),
    strikeThrough:       !!(el.closest('s') || el.closest('strike') || el.closest('del')),
    insertUnorderedList: !!el.closest('ul'),
    insertOrderedList:   !!el.closest('ol'),
  }
}

const AddTaskModal = ({ task, onClose, onSuccess }) => {
  const isEdit = !!task

  const [title,         setTitle]         = useState(task?.title || '')
  const [titleError,    setTitleError]    = useState('')
  const [activeFormats, setActiveFormats] = useState({})
  const [loading,       setLoading]       = useState(false)
  const [descCount,     setDescCount]     = useState(task?.description?.length || 0)
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && task?.description) {
      editorRef.current.innerHTML = task.description
    }
  }, [])

  const updateFormats = () => setActiveFormats(getActiveFormats())

  const applyFormat = (e, cmd) => {
    e.preventDefault()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return

    const range = sel.getRangeAt(0)
    const tag   = FORMAT_MAP[cmd]

    if (tag) {
      const node     = range.commonAncestorContainer
      const el       = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
      const existing = el.closest(tag)

      if (existing) {
        const parent = existing.parentNode
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
        parent.removeChild(existing)
      } else if (!range.collapsed) {
        try {
          const wrapper = document.createElement(tag)
          range.surroundContents(wrapper)
        } catch {
          const frag    = range.extractContents()
          const wrapper = document.createElement(tag)
          wrapper.appendChild(frag)
          range.insertNode(wrapper)
        }
      }
    } else if (cmd === 'insertUnorderedList' || cmd === 'insertOrderedList') {
      const listTag     = cmd === 'insertUnorderedList' ? 'ul' : 'ol'
      const node        = range.commonAncestorContainer
      const el          = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
      const existingList = el.closest(listTag)

      if (existingList) {
        const parent = existingList.parentNode
        ;[...existingList.children].forEach(li => {
          const div = document.createElement('div')
          div.innerHTML = li.innerHTML
          parent.insertBefore(div, existingList)
        })
        parent.removeChild(existingList)
      } else {
        const list = document.createElement(listTag)
        const li   = document.createElement('li')
        if (!range.collapsed) li.appendChild(range.extractContents())
        list.appendChild(li)
        range.insertNode(list)
      }
    }

    editorRef.current?.focus()
    updateFormats()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) { setTitleError('Title is required'); return }

    const description = editorRef.current?.innerHTML?.trim() || ''
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
            <div className={styles.labelRow}>
              <label className={styles.label}>Description</label>
              <span className={styles.counter}>{descCount}/500</span>
            </div>
            <div className={styles.editorWrap}>
              <div className={styles.toolbar}>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['bold'] ? styles.toolActive : ''}`} onMouseDown={(e) => applyFormat(e, 'bold')}><Bold size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['italic'] ? styles.toolActive : ''}`} onMouseDown={(e) => applyFormat(e, 'italic')}><Italic size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['underline'] ? styles.toolActive : ''}`} onMouseDown={(e) => applyFormat(e, 'underline')}><Underline size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['strikeThrough'] ? styles.toolActive : ''}`} onMouseDown={(e) => applyFormat(e, 'strikeThrough')}><Strikethrough size={14} /></button>
                <div className={styles.toolDivider} />
                <button type="button" className={`${styles.toolBtn} ${activeFormats['insertUnorderedList'] ? styles.toolActive : ''}`} onMouseDown={(e) => applyFormat(e, 'insertUnorderedList')}><List size={14} /></button>
                <button type="button" className={`${styles.toolBtn} ${activeFormats['insertOrderedList'] ? styles.toolActive : ''}`} onMouseDown={(e) => applyFormat(e, 'insertOrderedList')}><ListOrdered size={14} /></button>
              </div>
              <div
                ref={editorRef}
                className={styles.editor}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Start writing..."
                onKeyUp={(e) => { updateFormats(); const len = editorRef.current?.innerText?.length || 0; if (len > 500) { e.preventDefault(); editorRef.current.innerText = editorRef.current.innerText.slice(0, 500) } setDescCount(Math.min(len, 500)) }}
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
